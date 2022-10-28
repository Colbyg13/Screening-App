
import { useEffect, useMemo, useState } from 'react';
import { ALL_REQUIRED_STATION_FIELD_KEYS, REQUIRED_STATION_FIELDS } from '../constants/required-station-fields';

const fieldKeysStorageKey = 'fieldKeys';

export default function useFieldKeys() {

    const [allFields, setAllFields] = useState(JSON.parse(localStorage.getItem(fieldKeysStorageKey)) || []);

    const allFieldKeys = useMemo(() => allFields.map(({ key }) => key), [allFields]);
    const fieldKeyMap = useMemo(() => allFields.reduce((all, field) => ({
        ...all,
        [field.key]: field,
    }), {}), [allFields]);

    const sortedFieldKeys = useMemo(() => [
        'id',
        ...ALL_REQUIRED_STATION_FIELD_KEYS,
        ...allFieldKeys.filter(key => !REQUIRED_STATION_FIELDS[key] && (key !== 'id')),
    ], [allFieldKeys]);

    useEffect(() => {
        localStorage.setItem(fieldKeysStorageKey, JSON.stringify(allFields));
    }, [allFields]);

    useEffect(() => {
        window.api.getFields().then(fields => {
            if (fields) setAllFields(fields);
        });
    }, []);


    return {
        sortedFieldKeys,
        allFields,
        allFieldKeys,
        fieldKeyMap,
    }
}
