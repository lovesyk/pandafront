import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as entities from "entities";
import { Stats } from 'fs';
import { readFile, readdir, stat } from 'fs/promises';
import * as path from 'path';
import * as sharp from 'sharp';
import { Brackets, EntityManager, SelectQueryBuilder } from 'typeorm';
import { CategoryService } from './category.service';
import { GalleryEntity } from './entities/gallery.entity';
import { Tag } from './entities/tag.entity';
import { GalleryImage } from './models/image.model';
import { GalleryMetadata, GalleryMetadataList } from './models/metadata.model';
import OriginalGalleryMetadata from './models/original.metadata.model';
import { FindGalleriesRequest } from './requests/findGalleries.request';
import { FindSimilarGalleriesRequest } from './requests/findSimilarGalleries.request';
import { TagService } from './tag.service';
import IZipEntry, { ZipCache } from './zipCache';

interface ImageTask {
  galleryId: number,
  imageId?: number,
  task: () => Promise<GalleryImage | null>,
  resolve: (value: GalleryImage | PromiseLike<GalleryImage>) => void,
  reject: (reason?: any) => void,
}

@Injectable()
export class GalleryService {
  private MAX_CONCURRENT_IMAGE_TASKS = 5
  private imageTasks: ImageTask[] = [];
  private runningImageTasks = 0

  constructor(@InjectEntityManager() private entityManager: EntityManager,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private categoryService: CategoryService,
    private tagService: TagService) {
  }

  async readMetadataForGallery(galleryId: number): Promise<GalleryMetadata | undefined> {
    const gallery = await this.findGalleryEntity(galleryId)
    if (gallery) {
      return this.toApi(gallery)
    }
  }

  async readMetadata(metadataFilePath: string): Promise<OriginalGalleryMetadata> {
    const json = await readFile(metadataFilePath, "utf8")
    return JSON.parse(json, (key, value) => {
      if (typeof value === 'string') {
        return entities.decode(value)
      }
      return value
    })
  }

  toApi(galleryEntity: GalleryEntity): GalleryMetadata {
    return {
      gid: galleryEntity.gid,
      token: galleryEntity.token,
      title: galleryEntity.title,
      titleJpn: galleryEntity.titleJpn,
      category: galleryEntity.category.name,
      uploader: galleryEntity.uploader,
      postedDate: galleryEntity.postedDate,
      fileCount: galleryEntity.fileCount,
      fileSize: galleryEntity.fileSize,
      expunged: galleryEntity.expunged,
      rating: galleryEntity.rating,
      torrentCount: galleryEntity.torrentCount,
      tags: galleryEntity.tags.map(x => x.name),
      createdDate: galleryEntity.createdDate,
      updatedDate: galleryEntity.updatedDate
    }
  }

  async deleteDbCacheBefore(date: Date) {
    await this.entityManager.getRepository(GalleryEntity).createQueryBuilder()
      .delete()
      .where('updatedDate < :date', { date })
      .execute()
      .then(value => {
        if (value && value.affected && value.affected > 0) {
          Logger.debug(`Deleted ${value.affected} galleries found before ${date}`)
        }
      }).catch(reason => Logger.warn(`Failed deleting galleries found before ${date}: ${reason}`))
  }

  async updateGallery(dir: string) {
    let zipFilename: string | null = null
    let metadataFilePath: string | null = null

    try {
      for (var basename of await readdir(dir)) {
        const extension = path.extname(basename)

        if (this.isMetadataFile(basename)) {
          metadataFilePath = path.join(dir, basename)
        }
        if (extension === '.zip') {
          zipFilename = basename
        }
      }
    } catch { Logger.warn }

    let deleteGallery = true;

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      const galleryRepository = transactionalEntityManager.getRepository(GalleryEntity)
      if (metadataFilePath && zipFilename) {
        let metadataFile: OriginalGalleryMetadata;
        try {
          metadataFile = await this.readMetadata(metadataFilePath)
        } catch (reason) {
          Logger.warn(`Failed reading metadata file ${metadataFilePath}: ${reason}.`)
          return
        }

        const zipFilePath = path.join(dir, basename)
        let zipStat: Stats;
        try {
          zipStat = await stat(zipFilePath);
        } catch (reason) {
          Logger.warn(`Failed reading creation time for zip file ${zipFilePath}: ${reason}.`)
          return
        }

        const oldGallery = await galleryRepository.findOne({ where: { gid: metadataFile.gid } })
        const newGallery: GalleryEntity = {
          dir: dir,
          zipFilename: zipFilename,

          gid: metadataFile.gid,
          token: metadataFile.token,
          title: metadataFile.title,
          titleJpn: metadataFile.title_jpn,
          category: await this.categoryService.findOrCreate(metadataFile.category, oldGallery?.category, transactionalEntityManager),
          uploader: metadataFile.uploader ?? '',
          postedDate: new Date(metadataFile.posted * 1000),
          fileCount: metadataFile.filecount,
          fileSize: metadataFile.filesize,
          expunged: metadataFile.expunged,
          rating: metadataFile.rating,
          torrentCount: metadataFile.torrentcount,
          tags: await this.tagService.findOrCreateMultiple(metadataFile.tags, oldGallery ? oldGallery.tags : [], transactionalEntityManager),
          createdDate: new Date(zipStat.mtimeMs)
        }
        const gallery: GalleryEntity = { ...oldGallery, ...newGallery }

        await galleryRepository.save(gallery)
          .then(() => Logger.debug(`Cached gallery with ID ${gallery.gid} in DB.`))
          .catch(reason => Logger.warn(`Failed caching gallery with ID ${gallery.gid} in DB: ${reason}.`))

        deleteGallery = false
      }

      if (deleteGallery) {
        await galleryRepository.delete({ dir: dir })
          .then(value => {
            if (value && value.affected && value.affected > 0) {
              Logger.debug(`Cleared cache of ${value.affected} galleries found in ${dir}.`)
            }
          }).catch(reason => Logger.warn(`Failed removing DB cache of galleries found in ${dir}: ${reason}`))
      }
    })
  }

  isMetadataFile(metadataFile: string): boolean {
    return path.basename(metadataFile) === "api-metadata.json"
  }

  async findGalleryEntity(galleryId: number): Promise<GalleryEntity | null> {
    return this.entityManager.getRepository(GalleryEntity).findOne({ where: { gid: galleryId } })
  }

  async getImage(galleryId: number, imageId: number, width?: number, height?: number): Promise<GalleryImage | null> {
    return await this.runImageTask({
      galleryId, imageId, task: async () => {
        const zip = await this.findZip(galleryId)
        if (zip) {
          const zipEntries = zip.getEntries()
          if (imageId < zipEntries.length) {
            const zipEntry = zipEntries.sort(this.compareZipEntries)[imageId]
            const data = await zip.readFileAsync(zipEntry);
            const image = new GalleryImage(data, zipEntry.name)
            return await this.resize(image, width, height)
          }
        }

        return null
      }
    })
  }

  private async runImageTask(task: Pick<ImageTask, 'galleryId' | 'imageId' | 'task'>): Promise<GalleryImage | null> {
    return new Promise((resolve, reject) => {
      this.imageTasks = [...this.imageTasks, { ...task, resolve, reject }].sort(this.compareImageTasks);
      this.processImageTasks();
    });
  }

  private compareImageTasks(a: ImageTask, b: ImageTask): number {
    const galleryIdResult = b.galleryId - a.galleryId;
    if (galleryIdResult != 0) {
      return galleryIdResult;
    }

    if (a.imageId !== undefined) {
      if (b.imageId !== undefined) {
        return a.imageId - b.imageId;
      }
      return -1;
    }
    return 1;
  }

  private async processImageTasks() {
    while (this.runningImageTasks < this.MAX_CONCURRENT_IMAGE_TASKS && this.imageTasks.length > 0) {
      const { task, resolve, reject } = this.imageTasks.shift();
      this.runningImageTasks++;
      try {
        const result = await task();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        this.runningImageTasks--;
      }
    }
  }

  private async resize(image: GalleryImage, width?: number, height?: number): Promise<GalleryImage> {
    const thumbnail = width === 200 && height === 200

    if (!thumbnail && image.mimeType === 'image/gif') {
      return image
    }

    if (width || height) {
      let sharpImage = await sharp(image.buffer)

      let resizeOptions: sharp.ResizeOptions = { width: width, height: height, kernel: "cubic" }
      if (!thumbnail) {
        resizeOptions = { ...resizeOptions, fit: 'inside', withoutEnlargement: true }
      }

      const { data, info } = await sharpImage.
        resize(resizeOptions).
        jpeg({ force: true }).
        toBuffer({ resolveWithObject: true })

      image.overrideBuffer(data, info.format)
    }

    return image
  }

  private async findZip(galleryId: number): Promise<ZipCache | null> {
    const zipCacheKey = `gallery-${galleryId}-zip`
    let zip = await this.cacheManager.get<ZipCache>(zipCacheKey)
    if (zip) {
      Logger.debug(`Cache hit for ${zipCacheKey}.`)
    } else {
      Logger.debug(`${zipCacheKey} not in cache, loading freshly.`)
      const gallery = await this.findGalleryEntity(galleryId)
      if (gallery) {
        const zipFile = path.join(gallery.dir, gallery.zipFilename)
        Logger.debug(zipFile)
        zip = await ZipCache.create(zipFile)
        this.cacheManager.set(zipCacheKey, zip)
      }
    }

    return zip ?? null
  }

  private compareZipEntries(a: IZipEntry, b: IZipEntry): number {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  }

  async getImageCount(galleryId: number): Promise<number | null> {
    const zip = await this.findZip(galleryId)
    if (zip) {
      return zip.getEntryCount()
    }

    return null
  }

  async getThumbnail(galleryId: number): Promise<GalleryImage | null> {
    return await this.runImageTask({
      galleryId, task: async () => {
        const gallery = await this.findGalleryEntity(galleryId)
        const thumbnail = await readFile(path.join(gallery.dir, "thumbnail.jpg"))
          .then(value =>
            new GalleryImage(value, "thumbnail.jpg")
          )
          .catch(reason => {
            Logger.warn(`Failed reading thumbnail: ${reason}`)
          })

        return thumbnail ? thumbnail : null
      }
    })
  }

  private createFindGalleryQuery(request: FindGalleriesRequest): SelectQueryBuilder<GalleryEntity> {
    let queryBuilder = this.entityManager.getRepository(GalleryEntity).createQueryBuilder('gallery_entity')
    queryBuilder.leftJoinAndSelect('gallery_entity.category', 'category')
    queryBuilder.leftJoinAndSelect('gallery_entity.tags', 'tag')
    if (request.includedTags.length > 0) {
      const subquery = this.entityManager.getRepository(GalleryEntity).createQueryBuilder('gallery_entity')
        .select("gallery_entity_included_tag.galleryEntityId", "galleryEntityId")
        .leftJoin('gallery_entity.tags', 'included_tag')
        .where('included_tag.name IN(:...includedNames)', { includedNames: request.includedTags })
        .groupBy('gallery_entity.id')
        .having('COUNT(DISTINCT included_tag.id) = :count', { count: request.includedTags.length })

      queryBuilder
        .innerJoin("(" + subquery.getQuery() + ")", "included_tag_filter", "gallery_entity.id = included_tag_filter.galleryEntityId")
        .setParameters(subquery.getParameters())
    }
    if (request.excludedTags.length > 0) {
      const subquery = this.entityManager.getRepository(GalleryEntity).createQueryBuilder('gallery_entity')
        .select("gallery_entity_excluded_tag.galleryEntityId", "galleryEntityId")
        .leftJoin('gallery_entity.tags', 'excluded_tag')
        .where('excluded_tag.name IN(:...excludedNames)', { excludedNames: request.excludedTags })
        .groupBy('gallery_entity.id')
        .having('COUNT(DISTINCT excluded_tag.id) >= 0')

      queryBuilder
        .leftJoin("(" + subquery.getQuery() + ")", "excluded_tag_filter", "gallery_entity.id = excluded_tag_filter.galleryEntityId")
        .setParameters(subquery.getParameters())
    }
    queryBuilder.where('1 == 1')
    if (request.excludedTags.length > 0) {
      queryBuilder.andWhere('excluded_tag_filter.galleryEntityId IS NULL')
    }
    if (request.title) {
      queryBuilder.andWhere('(gallery_entity.title LIKE :title OR gallery_entity.titleJpn LIKE :title)', { title: `%${request.title}%` })
    }

    return queryBuilder
  }

  async findGalleries(request: FindGalleriesRequest): Promise<GalleryMetadataList> {
    let queryBuilder = this.createFindGalleryQuery(request)
    queryBuilder.orderBy('gallery_entity.createdDate', 'DESC')
    queryBuilder.skip(request.skip)
    queryBuilder.take(request.take)

    const [galleries, count] = await queryBuilder.getManyAndCount();
    return {
      data: galleries.map(this.toApi),
      count
    }
  }

  async findSimilarGalleries(request: FindSimilarGalleriesRequest): Promise<GalleryMetadataList> {
    const { galleryId, skip, take } = request

    const tagFilters = (alias: string) => {
      return new Brackets((qb) => {
        qb.where(`${alias}.name LIKE 'female:%'`)
          .orWhere(`${alias}.name LIKE 'male:%'`)
          .orWhere(`${alias}.name LIKE 'mixed:%'`)
      })
    }

    const tagCountQuery = (type: 'source' | 'target') =>
      this.entityManager.getRepository(Tag)
        .createQueryBuilder(`${type}_count_tag`)
        .select('COUNT(*)', 'count')
        .innerJoin(`${type}_count_tag.galleries`, `${type}_count_gallery`)
        .where(`${type}_count_gallery.id = ${type}_gallery.id`)
        .andWhere(tagFilters(`${type}_count_tag`))

    const idQuery = (qb: SelectQueryBuilder<GalleryEntity>) => qb.from(GalleryEntity, "source_gallery")
      .select("target_gallery.id", "id")
      .addSelect(
        `COUNT(*) * 2.0 / ((${tagCountQuery('source').getQuery()})
        + (${tagCountQuery('target').getQuery()}))`,
        'similarity'
      )
      .innerJoin("source_gallery.tags", "source_tag")
      .innerJoin("source_tag.galleries", "target_gallery")
      .where(`source_gallery.gid = :galleryId`, { galleryId })
      .andWhere(`target_gallery.gid != :galleryId`, { galleryId })
      .andWhere(tagFilters("source_tag"))
      .groupBy('target_gallery.id')
      .orderBy('similarity', 'DESC')
      .offset(skip)
      .limit(take)

    const galleries = await this.entityManager.getRepository(GalleryEntity)
      .createQueryBuilder('gallery_entity')
      .innerJoin(idQuery, "id_query", "gallery_entity.id = id_query.id")
      .leftJoinAndSelect('gallery_entity.category', 'category')
      .leftJoinAndSelect('gallery_entity.tags', 'tag')
      .orderBy('id_query.similarity', 'DESC')
      .getMany()

    return {
      data: galleries.map(this.toApi),
      count: take
    }
  }
}
