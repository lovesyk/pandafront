import GalleryMetadata from "./metadata.model";

export type Gallery = GalleryMetadata & { thumbnailUrl: string }
export type GalleryList = {
    data: Gallery[],
    count: number
}
