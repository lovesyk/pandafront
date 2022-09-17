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
  const TAGS_PARAM = 'tags'
  const PAGE_PARAM = 'page'
  const [searchParams, setSearchParams] = useSearchParams()
  const createSearchRequest = (): FindGalleryModel => {
    const searchRequest = new FindGalleryModel()
    const title = searchParams.get(SEARCH_PARAM);
    if (title) {
      searchRequest.title = title
    }

    const tags = searchParams.get(TAGS_PARAM)
    if (tags && tags.length > 0) {
      searchRequest.tags = JSON.parse(tags)
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

  const galleriesPerPage = 20
  const backend = new BackendClient()

  // const [searchTerm, setSearchTerm] = useState(searchParams.get(SEARCH_PARAM) ?? '')
  // useEffect(() => {
  //   if (searchTerm) {
  //     searchParams.set(SEARCH_PARAM, searchTerm)
  //   } else {
  //     searchParams.delete(SEARCH_PARAM)
  //   }
  //   setSearchParams(searchParams)
  // }, [searchTerm])

  // const [searchTags, setSearchTags] = useState(JSON.parse(searchParams.get(TAGS_PARAM) ?? '[]') as string[])
  // useEffect(() => {
  //   if (searchTags && searchTags.length > 0) {
  //     searchParams.set(TAGS_PARAM, JSON.stringify(searchTags))
  //   } else {
  //     searchParams.delete(TAGS_PARAM)
  //   }
  //   setSearchParams(searchParams)
  // }, [searchTags])

  // const [page, setPage] = useState<number>(searchParams.get(PAGE_PARAM) ? parseInt(searchParams.get(PAGE_PARAM)!) : 1)
  // useEffect(() => {
  //   if (page !== 1) {
  //     searchParams.set(PAGE_PARAM, JSON.stringify(page))
  //   } else {
  //     searchParams.delete(PAGE_PARAM)
  //   }
  //   setSearchParams(searchParams)
  // }, [page])

  const [galleries, setGalleries] = useState(Array<Gallery>())
  const [galleryCount, setGalleryCount] = useState<number>(0)

  const addTag = (tag: string) => {
    if (!searchRequest.tags.includes(tag)) {
      setSearchRequest({ ...searchRequest, tags: [...searchRequest.tags, tag] })
    }
  }

  const [loading, setLoading] = useState(true)
  const search = () => {
    setLoading(true)
    backend.findGalleries({ title: searchRequest.title, tags: searchRequest.tags, skip: (searchRequest.page - 1) * galleriesPerPage, take: galleriesPerPage }).then((value) => { setGalleries(value); setLoading(false); })
      .catch(console.log)
    backend.findGalleryCount({ title: searchRequest.title, tags: searchRequest.tags }).then(setGalleryCount).catch(console.log)
  }
  const updateSearchParams = () => {
    const newSearchParams: URLSearchParamsInit = {}
    if (searchRequest.title) {
      newSearchParams.title = searchRequest.title
    }
    if (searchRequest.tags && searchRequest.tags.length > 0) {
      newSearchParams.tags = JSON.stringify(searchRequest.tags)
    }
    if (searchRequest.page !== 1) {
      newSearchParams.page = JSON.stringify(searchRequest.page)
    }
    setSearchParams(newSearchParams)
  }
  useEffect(() => {
    if (!top) {
      updateSearchParams();
      search()
    }
  }, [searchRequest])

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
          <SearchPaging galleryCount={galleryCount} galleriesPerPage={galleriesPerPage} page={searchRequest.page} setPage={(page: number) => { setSearchRequest({ ...searchRequest, page: page }); }} />
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
          <SearchPaging galleryCount={galleryCount} galleriesPerPage={galleriesPerPage} page={searchRequest.page} setPage={(page: number) => { setSearchRequest({ ...searchRequest, page: page }); }} />
        </>}
    </>
  );
}
