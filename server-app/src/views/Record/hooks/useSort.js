import { useEffect, useMemo, useState } from "react";
import { ALL_REQUIRED_STATION_FIELD_KEYS, REQUIRED_STATION_FIELDS } from "../../../constants/required-station-fields";

const initialSortArr = [['id', -1]];

export default function useSort({
    allFieldKeys,
}) {

    const [sortArr, setSortArr] = useState(initialSortArr);
    const mainSortKey = sortArr[0]?.[0];

    const sort = useMemo(() => sortArr.reduce((all, [key, sortValue]) => ({
        ...all,
        [key]: sortValue,
    }), {}), [sortArr]);

    useEffect(() => {
        setSortArr([
            ['id', -1],
            ...ALL_REQUIRED_STATION_FIELD_KEYS.map(key => [key, 1]),
            ...allFieldKeys.filter(key => !REQUIRED_STATION_FIELDS[key] && (key !== 'id')).map(key => [key, 1]),
        ]);
    }, [allFieldKeys]);

    function updateSortArray(key) {
        const [_, oldValue] = sortArr.find(([k]) => k === key);
        setSortArr(sortArr => [[key, oldValue < 0 ? 1 : -1], ...sortArr.filter(([k]) => k !== key)]);
    }

    return {
        sort,
        mainSortKey,
        updateSortArray,
    }

}