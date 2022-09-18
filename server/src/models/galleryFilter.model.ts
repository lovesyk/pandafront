export interface GalleryFilter {
    title?: string
    includedTags?: string[]
    excludedTags?: string[]
    skip: number
    take: number
}