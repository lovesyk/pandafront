const mime = require('mime');

export class GalleryImage {
    mimeType: string
    constructor(public buffer: Buffer, public filename : string) {
        const recognizedMimeType = mime.getType(filename)
        this.mimeType = recognizedMimeType ?? 'application/octet-stream'
    }
}