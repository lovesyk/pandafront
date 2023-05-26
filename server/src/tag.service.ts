import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { TagFilter } from './models/tagFilter.model';

@Injectable()
export class TagService {
  constructor(@InjectEntityManager() private entityManager: EntityManager) { }

  async findOrCreateMultiple(names: string[], transactionalEntityManager: EntityManager): Promise<Tag[]> {
    return await Promise.all(names.map(name => this.findOrCreate(name, transactionalEntityManager)))
  }

  async find(filter: TagFilter): Promise<string[]> {
    let tags = new Set<string>()

    if (filter.name) {
      const exactValueTags = await this.entityManager.getRepository(Tag)
        .createQueryBuilder("tag")
        // https://stackoverflow.com/a/38330814
        .where("replace(tag.name, rtrim(tag.name, replace(tag.name, ':', '')), '') = :name", { name: filter.name })
        .getMany();
      exactValueTags.forEach(tag => tags.add(tag.name))
    }

    let suggestionQuery = this.entityManager.getRepository(Tag)
      .createQueryBuilder("tag")
      .addSelect('COUNT(gallery.id) as galleryCount')
      .leftJoin("tag.galleries", "gallery")
    if (filter.name) {
      suggestionQuery = suggestionQuery.where("tag.name like :name", { name: `%${filter.name}%` })
    }
    const suggestionTags = await suggestionQuery
      .groupBy("tag.id")
      .orderBy("galleryCount", "DESC")
      .take(20)
      .getMany();
      suggestionTags.forEach(tag => tags.add(tag.name))

    return Array.from(tags);
  }

  async findOrCreate(name: string, transactionalEntityManager: EntityManager): Promise<Tag> {
    const repository = transactionalEntityManager.getRepository(Tag)
    let tag = await repository.findOne({ where: { name: name } })
    if (!tag) {
      Logger.debug(`Caching tag ${name} in database...`)
      tag = { name: name, galleries: [] }
      await repository.save(tag)
    }

    return tag
  }
}
