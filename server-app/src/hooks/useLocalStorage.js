import { useEffect, useState } from 'react';

export default function useLocalStorage(storageKey, defaultValue) {
    const [value, setValue] = useState(
        JSON.parse(localStorage.getItem(storageKey)) ?? defaultValue,
    );

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(value));
    }, [value]);

    return [value, setValue];
}
