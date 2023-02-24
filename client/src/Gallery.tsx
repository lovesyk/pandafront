import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './App.css';
import BackendClient from './BackendClient';
import GalleryHeader from './GalleryHeader';
import GalleryMetadata from './models/metadata.model';

export default function Gallery() {
  const params = useParams()
  const galleryId = parseInt(params.galleryId!)
  const backend = new BackendClient()
  const [gallery, setGallery] = useState<GalleryMetadata>()
  const [imageUrls, setImageUrls] = useState(Array<string>())
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

  return (
    gallery ?
      <div>
        <GalleryHeader gallery={gallery} />
        {
          imageUrls.map((imageUrl, index) => {
            return (
              <Link to={`/galleries/${galleryId}/images/${index}`} style={{ height: "200px", width: "200px", display: "inline-flex", verticalAlign : "middle", justifyContent: "center", alignItems : "center" }}>
                <img src={imageUrl} alt="Image" />
              </Link>
            )
          })
        }
      </div>
      : <h2>Loading...</h2>
  )
}
