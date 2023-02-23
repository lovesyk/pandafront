import { TextField } from '@mui/material';
import { useDebouncedCallback } from 'use-debounce';
import './App.css';

export default function SearchTitle({ searchTerm, setSearchTerm }: { searchTerm: string, setSearchTerm: React.Dispatch<React.SetStateAction<string>> }) {
  return (
    <TextField label="Title search" variant="outlined" defaultValue={searchTerm} onChange={event => setSearchTerm(event.target.value)} />
  );
}
