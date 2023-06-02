import { Controller, Get, HttpException, HttpStatus, Logger, Param, Query, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { GalleryService } from './gallery.service';
import { GalleryMetadata, GalleryMetadataList } from './models/metadata.model';
import { FindGalleriesQuery } from './queries/findGalleries.query';
import { FindGalleriesRequest } from './requests/findGalleries.request';

@Controller("galleries")
export class GalleryController {
  constructor(private galleryService: GalleryService) {
  }

  @Get()
  async getGalleries(@Query() query: FindGalleriesQuery): Promise<GalleryMetadataList> {
    return this.galleryService.findGalleries(this.toRequest(query))
  }

  private toRequest(query: FindGalleriesQuery): FindGalleriesRequest {
    const request = new FindGalleriesRequest();
    if (query.title) {
      request.title = query.title
    }
    if (query.includedTags) {
      request.includedTags = JSON.parse(query.includedTags)
    }
    if (query.excludedTags) {
      request.excludedTags = JSON.parse(query.excludedTags)
    }
    if (query.skip) {
      request.skip = parseInt(query.skip)
    }
    if (query.take) {
      request.take = parseInt(query.take)
    }
    return request
  }

  @Get(":galleryId")
  async getGallery(@Param("galleryId") galleryId: number): Promise<GalleryMetadata> {
    return await this.galleryService.readMetadataForGallery(galleryId)
      .then(value => {
        if (!value) {
          throw new HttpException("Gallery doesn't exist.", HttpStatus.NOT_FOUND)
        }
        return value
      }).catch(reason => {
        Logger.error(reason)
        throw new HttpException("Gallery lookup failed.", HttpStatus.INTERNAL_SERVER_ERROR)
      })
  }

  @Get(":galleryId/images")
  async getImages(@Param("galleryId") galleryId: number): Promise<string> {
    const imageCount = await this.galleryService.getImageCount(galleryId)
    if (imageCount) {
      return imageCount.toString()
    }

    throw new HttpException("Could not find image count.", HttpStatus.NOT_FOUND)
  }

  @Get(":galleryId/images/:imageId")
  async getImage(@Param("galleryId") galleryId: number, @Param("imageId") imageId: number, @Res({ passthrough: true }) res: Response, @Query("width") width?: string, @Query("height") height?: string): Promise<StreamableFile> {
    const galleryImage = await this.galleryService.getImage(galleryId, imageId, parseInt(width) || null, parseInt(height) || null)
    if (!galleryImage) {
      throw new HttpException("Could not find image file.", HttpStatus.NOT_FOUND)
    }

    res.set({
      'Content-Type': galleryImage.mimeType
    })
    return new StreamableFile(galleryImage.buffer)
  }


  @Get(":galleryId/thumbnail")
  async getThumbnail(@Param("galleryId") galleryId: number, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const thumbnail = await this.galleryService.getThumbnail(galleryId)
    if (!thumbnail) {
      throw new HttpException("Could not find thumbnail file.", HttpStatus.NOT_FOUND)
    }

    res.set({
      'Content-Type': thumbnail.mimeType
    })
    return new StreamableFile(thumbnail.buffer)
  }
}
