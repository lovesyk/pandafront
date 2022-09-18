import SearchIcon from '@mui/icons-material/Search';
import { Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import FindGalleryModel from './models/findGallery.model';
import SearchTags from './SearchTags';
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
  const [includedTags, setIncludedTags] = useState(searchRequest.includedTags)
  const [excludedTags, setExcludedTags] = useState(searchRequest.excludedTags)
  useEffect(() => {
    setSearchTerm(searchRequest.title)
    setIncludedTags(searchRequest.includedTags)
    setExcludedTags(searchRequest.excludedTags)
  }, [searchRequest])

  const updateSearchRequest = () => {
    setSearchRequest({
      ...searchRequest,
      title: searchTerm,
      includedTags: includedTags,
      excludedTags: excludedTags,
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
      <SearchTags searchTags={includedTags} setSearchTags={setIncludedTags} id='included-tags' placeholder='Included tags' />
      <SearchTags searchTags={excludedTags} setSearchTags={setExcludedTags} id='excluded-tags' placeholder='Excluded tags'  />
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
