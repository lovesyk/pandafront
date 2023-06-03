import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  async findOrCreate(name: string, oldCategory: Category, transactionalEntityManager: EntityManager): Promise<Category> {
    const repository = transactionalEntityManager.getRepository(Category)

    let category: Category = null
    if (oldCategory) {
      if (name === oldCategory.name) {
        category = oldCategory
      } else {
        --oldCategory.count
        if (oldCategory.count < 1) {
          Logger.debug(`Removing category ${name} from database...`)
          repository.delete(oldCategory)
        } else {
          repository.save(oldCategory)
        }
      }
    }

    if (!category) {
      category = await repository.findOne({ where: { name: name } })
      if (category) {
        ++category.count
      } else {
        Logger.debug(`Caching category ${name} in database...`)
        category = { name: name, count: 1 }
      }
    }
    await repository.save(category)

    return category
  }
}
