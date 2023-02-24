import * as mime from 'mime';
import * as path from 'path';

const DEFAULT_MIME_TYPE = 'application/octet-stream'

export class GalleryImage {

    name: string
    mimeType: string
    constructor(public buffer: Buffer, filename: string) {
        const parsedPath = path.parse(filename)
        this.name = parsedPath.name
        this.mimeType = mime.getType(parsedPath.ext) ?? DEFAULT_MIME_TYPE
    }

    overrideBuffer(buffer: Buffer, format: string) {
        this.buffer = buffer
        this.mimeType = mime.getType(format) ?? DEFAULT_MIME_TYPE
    }

    createFilename() {
        const recognizedExtension = mime.getExtension(this.mimeType);
        const extension = recognizedExtension ? `.${recognizedExtension}` : '';
        return `${this.name}${extension}`
    }
}