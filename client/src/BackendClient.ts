import './App.css';
import { Gallery } from './models/gallery.model';
import GalleryMetadata from './models/metadata.model';
import { ScannerStats } from './models/scannerStats.model';
import { FindGalleriesRequest } from './requests/findGalleries.request';

export default class BackendClient {
  baseUrl = 'http://172.16.2.200:3000'
  baseUrlScanner = 'http://172.16.2.202:3000'

  async findGalleries(request: FindGalleriesRequest): Promise<Gallery[]> {
    const url = new URL(`${this.baseUrl}/galleries`)
    this.addFindGalleriesRequestSearchParams(url.searchParams, request)

    return fetch(url)
      .then(async response => {
        const galleryMetadataList: GalleryMetadata[] = await response.json()
        return galleryMetadataList.map(galleryMetadata => {
          return {
            ...galleryMetadata,
            thumbnailUrl: `${this.baseUrl}/galleries/${galleryMetadata.gid}/thumbnail`
          }
        })
      })
      .catch(err => {
        console.log(err.message)
        return Array<Gallery>()
      })
  }

  async findGalleryCount(request: FindGalleriesRequest): Promise<number> {
    const url = new URL(`${this.baseUrl}/galleries/count`)
    this.addFindGalleriesRequestSearchParams(url.searchParams, request)

    return fetch(url)
      .then(async response => {
        return await response.json();
      })
      .catch(err => {
        console.log(err.message)
        return 0
      })
  }

  private addFindGalleriesRequestSearchParams(searchParams: URLSearchParams, request: FindGalleriesRequest): void {
    if (request.title) {
      searchParams.set('title', request.title)
    }
    if (request.includedTags && request.includedTags.length > 0) {
      searchParams.set('includedTags', JSON.stringify(request.includedTags))
    }
    if (request.excludedTags && request.excludedTags.length > 0) {
      searchParams.set('excludedTags', JSON.stringify(request.excludedTags))
    }
    if (request.skip) {
      searchParams.set('skip', JSON.stringify(request.skip))
    }
    if (request.take) {
      searchParams.set('take', JSON.stringify(request.take))
    }
  }

  async findGallery(gid: number): Promise<Gallery> {
    return await fetch(`${this.baseUrl}/galleries/${gid}`)
      .then(async response => {
        const galleryMetadata: GalleryMetadata = await response.json()
        return {
          ...galleryMetadata,
          thumbnailUrl: `${this.baseUrl}/galleries/${galleryMetadata.gid}/thumbnail`
        }
      })
  }

  getImageUrl(galleryId: number, imageId: number, width?: number, height?: number): string {
    let url = `${this.baseUrl}/galleries/${galleryId}/images/${imageId}`
    if (width) {
      url += `?width=${width}`
      if (height) {
        url += `&height=${height}`
      }
    }
    if (height) {
      url += `?height=${height}`
    }

    return url
  }

  async findTags(name: string): Promise<string[]> {
    return fetch(`${this.baseUrl}/tags?name=${name}`)
      .then(response => response.json())
      .catch(err => {
        console.log(err.message)
        return Array<string>()
      })
  }

  async getScannerStats(): Promise<ScannerStats> {
    return fetch(`${this.baseUrlScanner}/scanner/stats`, { method: 'GET' })
      .then(response => response.json())
      .catch(err => {
        console.log(err.message)
      })
  }

  async enableScanner() {
    return fetch(`${this.baseUrlScanner}/scanner/enable`, { method: 'POST' })
      .then(response => response.json())
      .catch(err => {
        console.log(err.message)
      })
  }

  async disableScanner() {
    return fetch(`${this.baseUrlScanner}/scanner/disable`, { method: 'POST' })
      .then(response => response.json())
      .catch(err => {
        console.log(err.message)
      })
  }
}