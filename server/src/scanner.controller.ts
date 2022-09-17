import { Controller, Get, Post } from '@nestjs/common';
import { ScannerStats } from './models/scannerStats.model';
import { ScannerService } from './scanner.service';

@Controller("scanner")
export class ScannerController {
  constructor(private scannerService: ScannerService) { }

  @Get("stats")
  getStats(): ScannerStats {
    return this.scannerService.getStats()
  }

  @Get("restart")
  async restart() {
    await this.scannerService.restart()
  }

  @Post("enable")
  async enable() {
    await this.scannerService.enable()
  }

  @Post("disable")
  async disable() {
    await this.scannerService.disable()
  }
}
