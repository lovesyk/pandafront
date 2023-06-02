export default interface GalleryMetadata {
    gid: number
    token: string
    title: string
    titleJpn?: string
    category: string
    uploader: string
    postedDate: Date
    fileCount: number
    fileSize: number
    expunged: boolean
    rating: number
    torrentCount: number
    tags: string[]

    createdDate?: Date,
    updatedDate?: Date
}
