import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { TagFilter } from './models/tagFilter.model';

@Injectable()
export class TagService {
  constructor(@InjectEntityManager() private entityManager: EntityManager) { }

  async findOrCreateMultiple(names: string[], oldTags: Tag[], transactionalEntityManager: EntityManager): Promise<Tag[]> {
    const oldTagMap = new Map(
      oldTags.map(tag => {
        return [tag.name, tag];
      }),
    );
    return await Promise.all(names.map(name => this.findOrCreate(name, oldTagMap.get(name), transactionalEntityManager)))
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
    if (filter.name) {
      suggestionQuery = suggestionQuery.where("tag.name like :name", { name: `%${filter.name}%` })
    }
    const suggestionTags = await suggestionQuery
      .groupBy("tag.id")
      .orderBy("tag.count", "DESC")
      .take(20)
      .getMany();
    suggestionTags.forEach(tag => tags.add(tag.name))

    return Array.from(tags);
  }

  async findOrCreate(name: string, oldTag: Tag, transactionalEntityManager: EntityManager): Promise<Tag> {
    const repository = transactionalEntityManager.getRepository(Tag)

    let tag: Tag = null
    if (oldTag) {
      if (name === oldTag.name) {
        tag = oldTag
      } else {
        --oldTag.count
        if (oldTag.count < 1) {
          Logger.debug(`Removing tag ${name} from database...`)
          repository.delete(oldTag)
        } else {
          repository.save(oldTag)
        }
      }
    }

    if (!tag) {
      tag = await repository.findOne({ where: { name: name } })
      if (tag) {
        ++tag.count
      } else {
        Logger.debug(`Caching tag ${name} in database...`)
        tag = { name: name, count: 1, galleries: [] }
      }
    }
    await repository.save(tag)

    return tag
  }
}
