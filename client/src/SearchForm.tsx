import SearchIcon from '@mui/icons-material/Search';
import { Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import FindGalleryModel from './models/findGallery.model';
import SearchIncludedTags from './SearchIncludedTags';
import SearchTitle from './SearchTitle';

export default function SearchForm({ searchRequest, setSearchRequest }: { searchRequest: FindGalleryModel, setSearchRequest: (searchRequest: FindGalleryModel) => void }) {
  // const SEARCH_PARAM = 'title'
  // const TAGS_PARAM = 'tags'
  // const [searchParams, setSearchParams] = useSearchParams()

  // const createGallerySearchParams = (): Search => {
  //   const request: URLSearchParamsInit = {}
  //   if (searchTerm) {
  //     request[SEARCH_PARAM] = searchTerm
  //   }
  //   if (searchTags && searchTags.length > 0) {
  //     request[TAGS_PARAM] = JSON.stringify(searchTags)
  //   }
  //   return createSearchParams(request).toString()
  // }

  const [searchTerm, setSearchTerm] = useState(searchRequest.title)
  const [searchTags, setSearchTags] = useState(searchRequest.tags)
  useEffect(() => {
    setSearchTerm(searchRequest.title)
    setSearchTags(searchRequest.tags)
  }, [searchRequest])

  const updateSearchRequest = () => {
    setSearchRequest({
      ...searchRequest,
      title: searchTerm,
      tags: searchTags,
    })
  }

  // const [gallerySearchParams, setGallerySearchParams] = useState(createGallerySearchParams())
  // useEffect(() => {
  //   setGallerySearchParams(createGallerySearchParams())
  //   setSearchParams(searchParams)
  // }, [searchTerm, searchTags])
  // const updateSearchParams = () => {
  //   if (searchTerm) {
  //     searchParams.set(SEARCH_PARAM, searchTerm)
  //   } else {
  //     searchParams.delete(SEARCH_PARAM)
  //   }
  //   if (searchTags && searchTags.length > 0) {
  //     searchParams.set(TAGS_PARAM, JSON.stringify(searchTags))
  //   } else {
  //     searchParams.delete(TAGS_PARAM)
  //   }
  //   setSearchParams(searchParams)
  // }

  return (
    <Stack
      direction="column"
      spacing={2}
      width="500px"
    >
      <SearchTitle searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <SearchIncludedTags searchTags={searchTags} setSearchTags={setSearchTags} />
      {/* <Button component={Link} to={{
          pathname: "/search",
          search: createGallerySearchParams()
        }} variant="outlined" startIcon={<SearchIcon />}>
          Search
        </Button> */}
      <Button component={Link} to={'/search'} variant="outlined" startIcon={<SearchIcon />} onClick={updateSearchRequest} >
        Search
      </Button>
    </Stack>
  );
}
