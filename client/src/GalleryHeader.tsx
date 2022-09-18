import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import './App.css';
import GalleryMetadata from './models/metadata.model';

export default function GalleryHeader({ gallery }: { gallery: GalleryMetadata }) {
  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>{gallery.title}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Japanese Title</TableCell>
              <TableCell>{gallery.titleJpn}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>{gallery.category}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tags</TableCell>
              <TableCell>
                {
                  gallery.tags.map(tag => {
                    return <Chip key={'tag-' + tag} label={tag} size="small" />
                  })
                }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Posted</TableCell>
              <TableCell>{gallery.postedDate ? gallery.postedDate.toString() : '-'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
