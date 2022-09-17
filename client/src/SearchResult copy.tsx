import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import SyncDisabledIcon from '@mui/icons-material/SyncDisabled';
import { Box, Button, Container, List, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './App.css';
import BackendClient from './BackendClient';
import { Gallery } from './models/gallery.model';
import { ScannerStats } from './models/scannerStats.model';
import SearchIncludedTags from './SearchIncludedTags';
import SearchPaging from './SearchPaging';
import SearchResultGallery from './SearchResultGallery';
import SearchTitle from './SearchTitle';

export default function SearchResult() {
//   const SEARCH_PARAM = 'title'
//   const TAGS_PARAM = 'tags'
//   const PAGE_PARAM = 'page'
//   const galleriesPerPage = 20
//   const [searchParams, setSearchParams] = useSearchParams()
//   const backend = new BackendClient()

//   const [searchTerm, setSearchTerm] = useState(searchParams.get(SEARCH_PARAM) ?? '')
//   useEffect(() => {
//     if (searchTerm) {
//       searchParams.set(SEARCH_PARAM, searchTerm)
//     } else {
//       searchParams.delete(SEARCH_PARAM)
//     }
//     setSearchParams(searchParams)
//   }, [searchTerm])

//   const [searchTags, setSearchTags] = useState(JSON.parse(searchParams.get(TAGS_PARAM) ?? '[]') as string[])
//   useEffect(() => {
//     if (searchTags && searchTags.length > 0) {
//       searchParams.set(TAGS_PARAM, JSON.stringify(searchTags))
//     } else {
//       searchParams.delete(TAGS_PARAM)
//     }
//     setSearchParams(searchParams)
//   }, [searchTags])

//   const [page, setPage] = useState<number>(searchParams.get(PAGE_PARAM) ? parseInt(searchParams.get(PAGE_PARAM)!) : 1)
//   useEffect(() => {
//     if (page !== 1) {
//       searchParams.set(PAGE_PARAM, JSON.stringify(page))
//     } else {
//       searchParams.delete(PAGE_PARAM)
//     }
//     setSearchParams(searchParams)
//   }, [page])

//   const [galleries, setGalleries] = useState(Array<Gallery>())
//   const [galleryCount, setGalleryCount] = useState<number>(0)

//   const [scannerStats, setScannerStats] = useState<ScannerStats>()
//   useEffect(() => {
//     updateScannerStats()
//   }, [])
//   function updateScannerStats() {
//     backend.getScannerStats().then(setScannerStats)
//   }





//   const addTag = (tag: string) => {
//     if (!searchTags.includes(tag)) {
//       setSearchTags([...searchTags, tag])
//     }
//   }

//   const search = () => {
//     backend.findGalleries({ title: searchTerm, tags: searchTags, skip: (page - 1) * galleriesPerPage, take: galleriesPerPage }).then(setGalleries)
//       .catch(console.log)
//     backend.findGalleryCount({ title: searchTerm, tags: searchTags }).then(setGalleryCount).catch(console.log)
//   }

//   return (
//     <div>
//       <Stack
//   direction="column"
//   justifyContent="center"
//   alignItems="center"
//   spacing={2}
// >
//           <SearchTitle searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//           <SearchIncludedTags searchTags={searchTags} setSearchTags={setSearchTags} />
//           <Button variant="outlined" startIcon={<SearchIcon />} onClick={search}>
//             Search
//           </Button>
//         </Stack>
//       {scannerStats?.enabled ?
//         <Button variant="contained" endIcon={<SyncDisabledIcon />} onClick={() => { backend.disableScanner(); updateScannerStats(); }}>Disable Scanner</Button>
//         : <Button variant="contained" endIcon={<SyncIcon />} onClick={() => { backend.enableScanner(); updateScannerStats(); }}>Enable Scanner</Button>
//       }
//       <SearchPaging galleryCount={galleryCount} galleriesPerPage={galleriesPerPage} page={page} setPage={setPage} />
//       <List>
//         {
//           galleries.map(gallery => {
//             return <SearchResultGallery key={'gallery-' + gallery.gid} gallery={gallery} addTag={addTag} />
//           })
//         }
//       </List>
//       <SearchPaging galleryCount={galleryCount} galleriesPerPage={galleriesPerPage} page={page} setPage={setPage} />
//     </div>
//   );
}
