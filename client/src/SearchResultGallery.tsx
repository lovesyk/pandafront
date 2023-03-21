import { Avatar, Chip, Grid, ListItem, ListItemAvatar, ListItemText, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import './App.css';
import { Gallery } from './models/gallery.model';

export default function SearchResultGallery({ gallery, addTag }: { gallery: Gallery, addTag: (tag: string) => void }) {

  return (
    <ListItem button component={Link} to={`/galleries/${gallery.gid}`}>
      <ListItemAvatar>
        <Avatar variant="square" src={gallery.thumbnailUrl} alt="Gallery thumbnail" sx={{ height: '200px', width: '200px' }} imgProps={{ loading: "lazy" }} />
      </ListItemAvatar>
      <Stack direction="column">
        <ListItemText primary={gallery.titleJpn && gallery.titleJpn.match(/\S/g) ? gallery.titleJpn : gallery.title} />
        <Grid>
          {
            gallery.tags.map(tag => {
              return <Chip key={'tag-' + tag} label={tag} size="small" onClick={(event) => { event.stopPropagation(); event.preventDefault(); addTag(tag) }} />
            })
          }
        </Grid>
      </Stack>
    </ListItem>
  );
}
