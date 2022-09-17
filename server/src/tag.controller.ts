import { Controller, Get, Query } from '@nestjs/common';
import { TagFilter } from './models/tagFilter.model';
import { TagService } from './tag.service';

@Controller("tags")
export class TagController {
  constructor(private tagService: TagService) { }

  @Get()
  async find(@Query() filter: TagFilter): Promise<string[]> {
    return this.tagService.find(filter);
  }
}
