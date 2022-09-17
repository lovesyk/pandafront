import * as StreamZip from 'node-stream-zip';

export class ZipCache {
  private constructor() { }
  private streamZipOptions: StreamZip.StreamZipOptions
  private entries: IZipEntry[] = []

  static async create(zipFile: string): Promise<ZipCache> {
    const result = new ZipCache()

    result.streamZipOptions = { file: zipFile }
    let zip: StreamZip.StreamZipAsync;
    try {
      zip = new StreamZip.async(result.streamZipOptions);
      const entries = await zip.entries();
      for (const entry of Object.values(entries)) {
        if (entry.isFile) {
          result.entries.push({ name: entry.name })
        }
      }
    } finally {
      zip.close();
    }

    return result
  }

  getEntries(): IZipEntry[] {
    return this.entries
  }

  getEntryCount(): number {
    return this.entries.length
  }

  async readFileAsync(entry: IZipEntry): Promise<Buffer> {
    let zip: StreamZip.StreamZipAsync;
    try {
      zip = new StreamZip.async(this.streamZipOptions);
      return await zip.entryData(entry.name);
    } finally {
      zip.close();
    }
  }
}


export default interface IZipEntry {
  name: string
}
