import { Box, List } from '@mui/material';
import { useEffect, useState } from 'react';
import { URLSearchParamsInit, useSearchParams } from 'react-router-dom';
import './App.css';
import BackendClient from './BackendClient';
import FindGalleryModel from './models/findGallery.model';
import { Gallery } from './models/gallery.model';
import FindGalleriesQuery from './queries/findGalleries.query';
import SearchForm from './SearchForm';
import SearchPaging from './SearchPaging';
import SearchResultGallery from './SearchResultGallery';
import Settings from './Settings';

export default function SearchResult({ top }: { top: boolean }) {
  const SEARCH_PARAM = 'title'
  const INCLUDED_TAGS_PARAM = 'includedTags'
  const EXCLUDED_TAGS_PARAM = 'excludedTags'
  const PAGE_PARAM = 'page'
  const [searchParams, setSearchParams] = useSearchParams()
  const createSearchRequest = (): FindGalleryModel => {
    const searchRequest = new FindGalleryModel()
    const title = searchParams.get(SEARCH_PARAM);
    if (title) {
      searchRequest.title = title
    }

    const includedTags = searchParams.get(INCLUDED_TAGS_PARAM)
    if (includedTags && includedTags.length > 0) {
      searchRequest.includedTags = JSON.parse(includedTags)
    }
    const excludedTags = searchParams.get(EXCLUDED_TAGS_PARAM)
    if (excludedTags && excludedTags.length > 0) {
      searchRequest.excludedTags = JSON.parse(excludedTags)
    }

    const pageString = searchParams.get(PAGE_PARAM)
    if (pageString) {
      const page = parseInt(pageString)
      if (page > 1) {
        searchRequest.page = page
      }
    }

    return searchRequest
  }
  const [searchRequest, setSearchRequest] = useState(createSearchRequest())
  useEffect(() => {
    const newSearchRequest = createSearchRequest();
    setSearchRequest(newSearchRequest)
    search(newSearchRequest);
  }, [searchParams])

  const galleriesPerPage = 20
  const backend = new BackendClient()

  const [galleries, setGalleries] = useState(Array<Gallery>())
  const [galleryCount, setGalleryCount] = useState<number>(0)

  const addTag = (tag: string) => {
    if (!searchRequest.includedTags.includes(tag)) {
      setSearchRequest({ ...searchRequest, includedTags: [...searchRequest.includedTags, tag] })
    }
  }

  const [loading, setLoading] = useState(true)
  const search = (searchRequest : FindGalleryModel) => {
    setLoading(true)
    backend.findGalleries({ ...searchRequest, skip: (searchRequest.page - 1) * galleriesPerPage, take: galleriesPerPage }).then((value) => { setGalleries(value); setLoading(false); })
      .catch(console.log)
    backend.findGalleryCount({ ...searchRequest }).then(setGalleryCount).catch(console.log)
  }

  const setPage = (page: number): void => {
    if (page > 1) {
      searchParams.set(PAGE_PARAM, page.toString());
    } else {
      searchParams.delete(PAGE_PARAM);
    }
    setSearchParams(searchParams)
  }

  return (
    <>
      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        height={top ? "100vh" : undefined}
        padding={2}
      >
        <SearchForm searchRequest={searchRequest} setSearchRequest={setSearchRequest} />
        <Settings />
      </Box>
      {top ? <></> :
        <>
          <SearchPaging galleryCount={galleryCount} galleriesPerPage={galleriesPerPage} page={searchRequest.page} setPage={setPage} />
          {loading ?
            <b>Loading...</b>
            :
            <List>
              {
                galleries.map(gallery => {
                  return <SearchResultGallery key={'gallery-' + gallery.gid} gallery={gallery} addTag={addTag} />
                })
              }
            </List>}
          <SearchPaging galleryCount={galleryCount} galleriesPerPage={galleriesPerPage} page={searchRequest.page} setPage={setPage} />
        </>}
    </>
  );
}
