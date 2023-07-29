export class FindSimilarGalleriesRequest {
    galleryId: number;
    skip: number = 0
    take: number = 50

    constructor(galleryId: number) {
        this.galleryId = galleryId;
    }
}