import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import * as chokidar from 'chokidar';
import { opendir } from 'fs/promises';
import * as path from 'path';
import { EntityManager } from 'typeorm';
import { GalleryService } from './gallery.service';
import { ScannerStats } from './models/scannerStats.model';


@Injectable()
export class ScannerService {
  private events = [];
  initialScanRunning = true
  watcherEnabled = false
  watcher: chokidar.FSWatcher | null = null

  constructor(@InjectEntityManager() private entityManager: EntityManager,
    private galleryService: GalleryService) {
    this.processEvents()
    //this.enable()
  }

  private asyncWait = ms => new Promise(resolve => setTimeout(resolve, ms))
  private async processEvents() {
    while (true) {
      const event = this.events.pop()
      if (event) {
        await event()
      } else {
        await this.asyncWait(500)
      }
    }
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
      this.watcherEnabled = false
    }
  }

  private async scanManually(dir: string) {
    const now = new Date()
    await this.scanDir(dir)
    await this.finishInitialScan(now)
  }

  private async scanDir(currentDir: string) {
    const dir = await opendir(currentDir);
    for await (const dirent of dir) {
      if (dirent.name === 'api-metadata.json') {
        await this.galleryService.updateGallery(currentDir).catch(reason => Logger.warn(`Failed updating gallery: ${reason}`))
        return
      } else if (dirent.isDirectory()) {
        const nextDir = path.join(currentDir, dirent.name)
        await this.scanDir(nextDir)
      }
    }
  }

  async enable() {
    Logger.debug("Starting new watcher...")
    const root = "/data"
    this.watcherEnabled = true
    // https://github.com/paulmillr/chokidar/issues/1011
    await this.scanManually(root)

    this.watcher = chokidar.watch(root, {
      ignoreInitial: true
    }).on('all', (event, changedPath) => this.events.push(() => this.updateChangedPath(event, changedPath)))
  }

  getStats(): ScannerStats {
    return {
      enabled: this.watcherEnabled,
      // watched: this.watcher?.getWatched() ?? {}
    }
  }

  private updateChangedPath = async (event: string, changedPath: string) => {
    if (['add', 'unlink', 'change'].includes(event) && (!this.initialScanRunning || this.galleryService.isMetadataFile(changedPath))) {
      const dir = path.parse(changedPath).dir
      await this.galleryService.updateGallery(dir).catch(reason => Logger.warn(`Failed updating gallery: ${reason}`))
    }
  }

  private finishInitialScan = async (date: Date) => {
    this.initialScanRunning = false
    await this.galleryService.deleteDbCacheBefore(date)
  }
}
