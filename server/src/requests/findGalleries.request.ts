export class FindGalleriesRequest {
    title: string = '';
    includedTags: string[] = []
    excludedTags: string[] = []
    skip: number = 0
    take: number = 50
}