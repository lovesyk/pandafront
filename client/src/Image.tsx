import ArrowBackIcon from '@mui/icons-material/ArrowBackSharp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardSharp';
import { IconButton, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './App.css';
import BackendClient from './BackendClient';
import GalleryMetadata from './models/metadata.model';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export default function Image() {
  const params = useParams()
  const galleryId = parseInt(params.galleryId!)
  const imageId = parseInt(params.imageId!)
  const backend = new BackendClient()
  const [gallery, setGallery] = useState<GalleryMetadata>()
  useEffect(() => {
    backend.findGallery(galleryId).then(setGallery)
  }, [])

  document.onkeydown = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode === 39) {
      document.getElementById("forwardButton")?.click()
    }
    if (evt.keyCode === 37) {
      document.getElementById("backButton")?.click()
    }
};
  return (
    gallery ?
      <Stack direction="row" justifyContent="center" alignItems="stretch" sx={{ height: '100vh' }}>
        <IconButton id="backButton" aria-label="backward" size="large" component={Link} to={`/galleries/${gallery.gid}/images/${imageId - 1}`} disabled={imageId <= 0} sx={{ borderRadius: '0' }}>
          <ArrowBackIcon fontSize="inherit" />
        </IconButton>
        <img src={backend.getImageUrl(galleryId, imageId, undefined, getWindowDimensions().height)} alt="Image" />
        <IconButton id="forwardButton" aria-label="forward" size="large" component={Link} to={`/galleries/${gallery.gid}/images/${imageId + 1}`} disabled={imageId > gallery.fileCount - 2} sx={{ borderRadius: '0' }}>
          <ArrowForwardIcon fontSize="inherit" />
        </IconButton>
      </Stack>
      : <h2>Loading...</h2>
  )
}
