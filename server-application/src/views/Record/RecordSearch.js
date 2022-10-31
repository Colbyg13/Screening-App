import { TextField } from '@mui/material';
import React, { useState } from 'react';
import useDebounce from '../../hooks/useDebounce';

export default function RecordSearch({
    updateSearch,
}) {

    const [searchInput, setSearchInput] = useState('');

    useDebounce(() => {
        updateSearch(searchInput);
    }, 300, [searchInput]);


    return (
        <TextField
            className='w-1/2 min-w-fit'
            size='small'
            placeholder='Search'
            style={{
                background: 'white',
            }}
            value={searchInput}
            onChange={({ target: { value } }) => setSearchInput(value)}
        />
    );
}
