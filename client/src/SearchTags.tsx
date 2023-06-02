import { Autocomplete, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import './App.css';
import BackendClient from './BackendClient';

export default function SearchTags({ searchTags, setSearchTags, id, placeholder }: { searchTags: string[], setSearchTags: React.Dispatch<React.SetStateAction<string[]>>, id: string, placeholder: string }) {
  const [searchTag, setSearchTag] = useState('')

  const [suggestedTags, setSuggestedTags] = useState(Array<string>())
  const backend = new BackendClient()

  const [searchTagDebounced] = useDebounce(searchTag, 500)
  useEffect(() => {
    backend.findTags(searchTagDebounced).then(setSuggestedTags).catch(console.log)
  }, [searchTagDebounced])

  return (
    <Autocomplete
      multiple
      id={id}
      filterOptions={(x) => x}
      options={[...searchTags, ...suggestedTags.filter(tag => !searchTags.includes(tag))]}
      value={searchTags}
      inputValue={searchTag}
      onInputChange={(event, value) => { setSearchTag(value) }}
      onChange={(event, value) => setSearchTags(value)}
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} />
      )}
      sx={{ minWidth: '250px' }}
    />
  );
}
