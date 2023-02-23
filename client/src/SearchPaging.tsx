import { Pagination, Stack } from '@mui/material';
import './App.css';

export default function SearchPaging({ galleryCount, galleriesPerPage, page, setPage }: { galleryCount: number; galleriesPerPage: number; page: number; setPage: (page : number) => void }) {
  return (
    <Stack direction='column'>
      <p>Total gallery count: {galleryCount}</p>
      <Stack spacing={2}>
        <Pagination count={Math.ceil(galleryCount / galleriesPerPage)} siblingCount={2} variant="outlined" shape="rounded" page={page} onChange={(event, page) => setPage(page)} />
      </Stack>
    </Stack>
  );
}
