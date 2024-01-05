import { useMemo, useState } from 'react';

const initialSortArr = [['id', -1]];

export default function useSort() {
    const [sortKey, setSortKey] = useState({
        key: 'id',
        value: -1,
    });

    const sort = useMemo(() => ({ [sortKey.key]: sortKey.value }), [sortKey]);

    function updateSortArray(key) {
        setSortKey(({ key: oldKey, value: oldValue }) => ({
            key,
            value: oldKey === key && oldValue > 0 ? -1 : 1,
        }));
    }

    return {
        sortKey,
        sort,
        updateSortArray,
    };
}
