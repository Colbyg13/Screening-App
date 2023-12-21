import { useState } from 'react';

export default function useSearch() {
    const [search, setSearch] = useState('');

    function updateSearch(newSearch) {
        setSearch(newSearch);
    }

    return {
        search,
        updateSearch,
    };
}
