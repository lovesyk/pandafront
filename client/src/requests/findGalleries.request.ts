export interface FindGalleriesRequest {
    title?: string
    includedTags?: string[]
    excludedTags?: string[]
    skip?: number
    take?: number
}