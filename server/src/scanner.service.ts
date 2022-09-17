import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import * as chokidar from 'chokidar';
import * as path from 'path';
import { EntityManager } from 'typeorm';
import { GalleryService } from './gallery.service';
import { ScannerStats } from './models/scannerStats.model';

@Injectable()
export class ScannerService {
  initialScanRunning = true
  watcher: chokidar.FSWatcher | null = null

  constructor(@InjectEntityManager() private entityManager: EntityManager,
    private galleryService: GalleryService) {
    //this.enable()
  }

  async restart() {
    await this.disable();
    await this.enable();
  }

  async disable() {
    if (this.watcher) {
      Logger.debug("Stopping current watcher...")
      await this.watcher.close()
      this.watcher = null
    }
  }

  async enable() {
    Logger.debug("Starting new watcher...")
    const now = new Date()
    const root = "/data"
    this.watcher = chokidar.watch(root, {
      ignoreInitial: false
    })
      .on('all', (event, changedPath) => this.updateChangedPath(event, changedPath))
      .on('ready', () => this.finishInitialScan(now))
  }

  getStats(): ScannerStats {
    return {
      enabled: this.watcher !== null,
      // watched: this.watcher?.getWatched() ?? {}
    }
  }

  private updateChangedPath = async (event: string, changedPath: string) => {
    if (['add', 'unlink', 'change'].includes(event) && (!this.initialScanRunning || this.galleryService.isMetadataFile(changedPath))) {
      const dir = path.parse(changedPath).dir
      this.galleryService.updateGallery(dir).catch(reason => Logger.warn(`Failed updating gallery: ${reason}`))
    }
  }

  private finishInitialScan = async (date: Date) => {
    this.initialScanRunning = false
    //await this.galleryService.deleteDbCacheBefore(date)
  }
}
