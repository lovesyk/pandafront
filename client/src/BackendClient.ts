import './App.css';
import { Gallery, GalleryList } from './models/gallery.model';
import GalleryMetadata from './models/metadata.model';
import { ScannerStats } from './models/scannerStats.model';
import { FindGalleriesRequest } from './requests/findGalleries.request';

export default class BackendClient {
  private getServerUrl() {
    return `${window.location.protocol}//${window.location.host}/server`
  }

  async findGalleries(request: FindGalleriesRequest): Promise<GalleryList> {
    const url = new URL(`${this.getServerUrl()}/galleries`)
    this.addFindGalleriesRequestSearchParams(url.searchParams, request)

    return fetch(url)
      .then(async response => {
        const galleryMetadataList: GalleryList = await response.json()
        return {
          data: galleryMetadataList.data.map(galleryMetadata => {
            return {
              ...galleryMetadata,
              thumbnailUrl: `${this.getServerUrl()}/galleries/${galleryMetadata.gid}/thumbnail`
            }
          }),
          count: galleryMetadataList.count
        }
      })
      .catch(err => {
        console.log(err.message)
        return {
          data: [],
          count: 0
        }
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
    return await fetch(`${this.getServerUrl()}/galleries/${gid}`)
      .then(async response => {
        const galleryMetadata: GalleryMetadata = await response.json()
        return {
          ...galleryMetadata,
          thumbnailUrl: `${this.getServerUrl()}/galleries/${galleryMetadata.gid}/thumbnail`
        }
      })
  }

  getImageUrl(galleryId: number, imageId: number, width?: number, height?: number): string {
    let url = `${this.getServerUrl()}/galleries/${galleryId}/images/${imageId}`
    if (width) {
      url += `?width=${width}`
      if (height) {
        url += `&height=${height}`
      }
    } else if (height) {
      url += `?height=${height}`
    }

    return url
  }

  async findTags(name: string): Promise<string[]> {
    return fetch(`${this.getServerUrl()}/tags?name=${name}`)
      .then(response => response.json())
      .catch(err => {
        console.log(err.message)
        return Array<string>()
      })
  }

  async getScannerStats(): Promise<ScannerStats | null> {
    return fetch(`${this.getServerUrl()}/scanner/stats`, { method: 'GET' })
      .then(response => response.json())
      .catch(err => {
        console.log(err.message)
        return null
      })
  }

  async enableScanner() {
    return fetch(`${this.getServerUrl()}/scanner/enable`, { method: 'POST' })
      .then(response => response.json())
      .catch(err => {
        console.log(err.message)
      })
  }

  async disableScanner() {
    return fetch(`${this.getServerUrl()}/scanner/disable`, { method: 'POST' })
      .then(response => response.json())
      .catch(err => {
        console.log(err.message)
      })
  }

  async findSimilarGalleries(galleryId: number): Promise<GalleryList> {
    const url = new URL(`${this.getServerUrl()}/galleries/${galleryId}/similar`)

    return fetch(url)
      .then(async response => {
        const galleryMetadataList: GalleryList = await response.json()
        return {
          data: galleryMetadataList.data.map(galleryMetadata => {
            return {
              ...galleryMetadata,
              thumbnailUrl: `${this.getServerUrl()}/galleries/${galleryMetadata.gid}/thumbnail`
            }
          }),
          count: galleryMetadataList.count
        }
      })
      .catch(err => {
        console.log(err.message)
        return {
          data: [],
          count: 0
        }
      })
  }
}
