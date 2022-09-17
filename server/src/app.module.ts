import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import Configuration from './configuration';
import { Category } from './entities/category.entity';
import { GalleryEntity } from './entities/gallery.entity';
import { Tag } from './entities/tag.entity';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { ScannerController } from './scanner.controller';
import { ScannerService } from './scanner.service';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import * as CustomMemoryStore from '../custom-memory';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'app.sql',
      entities: [GalleryEntity, Category, Tag],
      synchronize: true
    }),
    TypeOrmModule.forFeature([GalleryEntity, Category, Tag]),
    CacheModule.register({ store: CustomMemoryStore.create({ ttl: 5, ttlAutopurge: true }) })],
  controllers: [GalleryController, TagController, ScannerController],
  providers: [GalleryService, CategoryService, TagService, ScannerService],
})
export class AppModule { }
