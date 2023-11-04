import { List } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './App.css';
import BackendClient from './BackendClient';
import GalleryHeader from './GalleryHeader';
import SearchResultGallery from './SearchResultGallery';
import { Gallery as GalleryModel } from './models/gallery.model';
import GalleryMetadata from './models/metadata.model';

export default function Gallery() {
  const params = useParams()
  const galleryId = parseInt(params.galleryId!)
  const backend = new BackendClient()
  const [gallery, setGallery] = useState<GalleryMetadata>()
  const [imageUrls, setImageUrls] = useState(Array<string>())
  const [similarGalleries, setSimilarGalleries] = useState<GalleryModel[]>([])
  useEffect(() => {
    backend.findGallery(galleryId).then(gallery => {
      setGallery(gallery)

      let imageUrls = Array<string>()
      for (let i = 0; i < gallery.fileCount ?? 0; ++i) {
        imageUrls.push(backend.getImageUrl(gallery.gid, i, 200, 200))
      }
      setImageUrls(imageUrls)
    })
  }, [galleryId])

  const [imageLoadedCount, setImageLoadedCount] = useState(0);
  useEffect(() => {
    if (imageLoadedCount > 0 && imageLoadedCount >= imageUrls.length) {
      backend.findSimilarGalleries(galleryId).then((value) => { setSimilarGalleries(value.data); }).catch(console.log)
    }
  }, [imageLoadedCount])

  return (
    <>
      {gallery ?
        <div>
          <GalleryHeader gallery={gallery} />
          {
            imageUrls.map((imageUrl, index) => {
              return (
                <Link key={index} to={`/galleries/${galleryId}/images/${index}`} style={{ display: "inline-flex", verticalAlign: "middle", justifyContent: "center", alignItems: "center" }}>
                  <img src={imageUrl} width={200} height={200} alt="Image" loading="lazy" onLoad={() => setImageLoadedCount(imageLoadedCount => imageLoadedCount + 1)} />
                </Link>
              )
            })
          }
        </div>
        : <h2>Loading...</h2>}
      <div>
        <h3>Similar galleries</h3>
        <List>
          {
            similarGalleries.map(gallery => {
              return <SearchResultGallery key={'gallery-' + gallery.gid} gallery={gallery} addTag={() => { }} />
            })
          }
        </List>
      </div>
    </>
  )
}
