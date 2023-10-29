import { Injectable, Logger } from '@nestjs/common';
import { opendir, stat } from 'fs/promises';
import { FSWatcher, watch } from 'node:fs';
import * as path from 'path';
import { GalleryService } from './gallery.service';
import { ScannerStats } from './models/scannerStats.model';

const ROOT = "/data"
const EVENT_DELAY_SEC = 30

@Injectable()
export class ScannerService {
  private scannerEnabled = false
  private initialScanRunning = false
  private watchers: { [key: string]: FSWatcher } = {}
  private debouncedEvents: { [key: string]: NodeJS.Timeout } = {}

  constructor(private galleryService: GalleryService) {
    if (!process.env.DISABLE_SCANNER) {
      this.enable();
    }
  }

  async restart() {
    await this.disable();
    await this.enable();
  }

  async disable() {
    if (this.scannerEnabled) {
      Logger.debug("Stopping scanner...")
      this.initialScanRunning = true
      this.removeWatchers(ROOT)

      this.scannerEnabled = false
      this.initialScanRunning = false
    }
  }

  async enable() {
    if (!this.scannerEnabled) {
      Logger.debug("Starting scanner...")
      this.scannerEnabled = true
      this.initialScanRunning = true

      const now = new Date()
      await this.scanDir(ROOT)
      await this.galleryService.deleteDbCacheBefore(now)
      this.initialScanRunning = false
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
      this.watchers[dir] = watch(dir, (event, filename) => this.debouncedOnWatcherChanged(dir, filename))
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

  private debouncedOnWatcherChanged(dir: string, filename: string) {
    const key = dir + (filename ? filename : '')

    const previousEvent = this.debouncedEvents[key]
    if (previousEvent) {
      clearTimeout(previousEvent)
    }

    this.debouncedEvents[key] = setTimeout(() => {
      this.onWatcherChanged(dir, filename)
      delete this.debouncedEvents[key]
    }, 1000 * EVENT_DELAY_SEC)
  }

  private onWatcherChanged = async (dir: string, filename: string) => {
    // TODO handle watchers not supplying a filename

    let filepath = path.join(dir, filename)
    Logger.debug(`Watcher event: ${filepath}`)

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

  getStats(): ScannerStats {
    return {
      enabled: this.scannerEnabled,
      initialScanRunning: this.initialScanRunning
    }
  }
}
