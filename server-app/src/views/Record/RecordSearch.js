import { TextField } from '@mui/material';
import React, { useState } from 'react';
import useDebounce from '../../hooks/useDebounce';

export default function RecordSearch({ updateSearch }) {
    const [searchInput, setSearchInput] = useState('');

    useDebounce(
        () => {
            updateSearch(searchInput);
        },
        300,
        [searchInput],
    );

    return (
        <input
            className="h-10 w-1/2 px-2 min-w-fit bg-white rounded-full shadow-inner placeholder-gray-400 outline-green-300"
            placeholder="Search"
            value={searchInput}
            onChange={({ target: { value } }) => setSearchInput(value)}
        />
    );
}
