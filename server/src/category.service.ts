import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  async findOrCreate(name: string, transactionalEntityManager : EntityManager) : Promise<Category> {
    const repository = transactionalEntityManager.getRepository(Category)
    let category = await repository.findOne({where: {name : name}})
    if (!category) {
      Logger.debug(`Caching category ${name} in database...`)
      category = { name: name }
      await repository.save(category)
    }

    return category
  }
}
