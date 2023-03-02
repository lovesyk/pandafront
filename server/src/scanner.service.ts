import { Injectable, Logger } from '@nestjs/common';
import { opendir, stat } from 'fs/promises';
import { FSWatcher, watch } from 'node:fs';
import * as path from 'path';
import { GalleryService } from './gallery.service';
import { ScannerStats } from './models/scannerStats.model';

const ROOT = "/data"

@Injectable()
export class ScannerService {
  private scannerEnabled = false
  private initialScanRunning = true
  private watchers: { [key: string]: FSWatcher } = {}

  constructor(private galleryService: GalleryService) {
    this.enable();
  }

  async restart() {
    await this.disable();
    await this.enable();
  }

  async disable() {
    if (this.scannerEnabled) {
      Logger.debug("Stopping scanner...")
      this.removeWatchers(ROOT)
      this.scannerEnabled = false
    }
  }

  async enable() {
    if (!this.scannerEnabled) {
      Logger.debug("Starting scanner...")
      this.scannerEnabled = true

      const now = new Date()
      await this.scanDir(ROOT)
      await this.finishInitialScan(now)
    }
  }

  private async scanDir(currentDir: string) {
    this.addWatcher(currentDir)

    const dir = await opendir(currentDir, { bufferSize: 2048 });
    for await (const dirent of dir) {
      if (dirent.name === 'api-metadata.json') {
        await this.updateGallery(currentDir)
      } else if (dirent.isDirectory()) {
        const nextDir = path.join(currentDir, dirent.name)
        await this.scanDir(nextDir)
      }
    }
  }

  private addWatcher(dir: string) {
    if (!(dir in this.watchers)) {
      Logger.debug(`Adding watcher: ${dir}`)
      this.watchers[dir] = watch(dir, (event, filename) => this.onWatcherChanged(event, dir, filename))
    }
  }

  private removeWatchers(dir: string) {
    for (const key in this.watchers) {
      if (key.startsWith(dir)) {
        Logger.debug(`Removing watcher: ${key}`)
        if (this.watchers[key]) {
          this.watchers[key].close()
        }
        delete this.watchers[key]
      }
    }
  }

  private onWatcherChanged = async (event: string, dir: string, filename: string) => {
    // TODO handle watchers not supplying a filename

    let filepath = path.join(dir, filename)
    Logger.debug(`Watcher event "${event}": ${filepath}`)

    let isDirectory = false
    try {
      const stats = await stat(filepath)
      isDirectory = stats.isDirectory()
    } catch (err) {
      // in case a directory is no longer accessible
      this.removeWatchers(filepath)
    }

    if (isDirectory) {
      await this.scanDir(filepath)
    } else {
      await this.updateGallery(dir)
    }
  }

  private async updateGallery(dir: string) {
    await this.galleryService.updateGallery(dir).catch(reason => Logger.warn(`Failed updating gallery: ${reason}`))
  }

  private finishInitialScan = async (date: Date) => {
    await this.galleryService.deleteDbCacheBefore(date)
    this.initialScanRunning = false
  }

  getStats(): ScannerStats {
    return {
      enabled: this.scannerEnabled,
      initialScanRunning: this.initialScanRunning
    }
  }
}
