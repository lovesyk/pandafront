import SearchIcon from '@mui/icons-material/Search';
import { Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { createSearchParams, Link, URLSearchParamsInit } from 'react-router-dom';
import './App.css';
import FindGalleryModel from './models/findGallery.model';
import SearchTags from './SearchTags';
import SearchTitle from './SearchTitle';

export default function SearchForm({ searchRequest, setSearchRequest }: { searchRequest: FindGalleryModel, setSearchRequest: (searchRequest: FindGalleryModel) => void }) {
  const [searchTerm, setSearchTerm] = useState(searchRequest.title)
  const [includedTags, setIncludedTags] = useState(searchRequest.includedTags)
  const [excludedTags, setExcludedTags] = useState(searchRequest.excludedTags)
  useEffect(() => {
    setSearchRequest({
      ...searchRequest,
      title: searchTerm,
      includedTags: includedTags,
      excludedTags: excludedTags,
    })
  }, [searchTerm, includedTags, excludedTags])

  const createSearchParamsString = (): string => {
    const newSearchParams: URLSearchParamsInit = {}
    if (searchRequest.title) {
      newSearchParams.title = searchRequest.title
    }
    if (searchRequest.includedTags && searchRequest.includedTags.length > 0) {
      newSearchParams.includedTags = JSON.stringify(searchRequest.includedTags)
    }
    if (searchRequest.excludedTags && searchRequest.excludedTags.length > 0) {
      newSearchParams.excludedTags = JSON.stringify(searchRequest.excludedTags)
    }
    if (searchRequest.page !== 1) {
      newSearchParams.page = JSON.stringify(searchRequest.page)
    }

    return createSearchParams(newSearchParams).toString()
  }

  return (
    <Stack
      direction="column"
      spacing={2}
      width="500px"
    >
      <SearchTitle searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <SearchTags searchTags={includedTags} setSearchTags={setIncludedTags} id='included-tags' placeholder='Included tags' />
      <SearchTags searchTags={excludedTags} setSearchTags={setExcludedTags} id='excluded-tags' placeholder='Excluded tags' />
      <Button component={Link} to={{ pathname: "/search", search: createSearchParamsString() }} variant="outlined" startIcon={<SearchIcon />} >
        Search
      </Button>
    </Stack>
  );
}
