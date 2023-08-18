import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { GalleryEntity } from './entities/gallery.entity';
import { Tag } from './entities/tag.entity';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { ScannerController } from './scanner.controller';
import { ScannerService } from './scanner.service';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  imports: [

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: '/db/app.sql',
      entities: [GalleryEntity, Category, Tag],
      synchronize: true
    }),
    TypeOrmModule.forFeature([GalleryEntity, Category, Tag]),
    CacheModule.register({ ttl: 5 * 60 * 1000 })],
  controllers: [GalleryController, TagController, ScannerController],
  providers: [GalleryService, CategoryService, TagService, ScannerService],
})
export class AppModule { }
