import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Like } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { TagFilter } from './models/tagFilter.model';

@Injectable()
export class TagService {
  constructor(@InjectEntityManager() private entityManager: EntityManager) { }

  async findOrCreateMultiple(names: string[], transactionalEntityManager: EntityManager): Promise<Tag[]> {
    return await Promise.all(names.map(name => this.findOrCreate(name, transactionalEntityManager)))
  }

  async find(filter: TagFilter): Promise<string[]> {
    let findOptionsWhere: FindOptionsWhere<Tag> = {}
    if (filter.name) {
      findOptionsWhere.name = Like(`%${filter.name}%`)
    }

    const tags = await this.entityManager.getRepository(Tag).find({ where: findOptionsWhere, take: 20 });
    return tags.map(tag => tag.name);
  }

  async findOrCreate(name: string, transactionalEntityManager: EntityManager): Promise<Tag> {
    const repository = transactionalEntityManager.getRepository(Tag)
    let tag = await repository.findOne({ where: { name: name } })
    if (!tag) {
      Logger.debug(`Caching tag ${name} in database...`)
      tag = { name: name }
      await repository.save(tag)
    }

    return tag
  }
}
