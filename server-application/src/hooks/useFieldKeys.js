
import { useEffect, useMemo, useState } from 'react';

const fieldKeysStorageKey = 'fieldKeys';

export default function useFieldKeys() {

    const [allFields, setAllFields] = useState(JSON.parse(localStorage.getItem(fieldKeysStorageKey)) || []);

    const allFieldKeys = useMemo(() => allFields.map(({ key }) => key), [allFields]);
    const fieldKeyMap = useMemo(() => allFields.reduce((all, field) => ({
        ...all,
        [field.key]: field,
    }), {}), [allFields]);

    useEffect(() => {
        localStorage.setItem(fieldKeysStorageKey, JSON.stringify(allFields));
    }, [allFields]);

    useEffect(() => {
        window.api.getFields().then(fields => {
            if (fields) setAllFields(fields);
        });
    }, []);


    return {
        allFields,
        allFieldKeys,
        fieldKeyMap,
    }
}
