
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { LOG_LEVEL } from '../../../constants/log-levels';
import { ALL_REQUIRED_STATION_FIELD_KEYS, REQUIRED_STATION_FIELDS } from '../../../constants/required-station-fields';
import { serverURL } from '../../../constants/server';

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
        // updates the local storage when allFields are updated
        localStorage.setItem(fieldKeysStorageKey, JSON.stringify(allFields));
    }, [allFields]);

    useEffect(() => {
        getFields();
    }, []);

    async function getFields() {
        try {
            const result = await axios.get(`${serverURL}/api/v1/fields`);
            console.log({ result });
            setAllFields(result.data);
        } catch (error) {
            console.error("Could not get fields from server", error);
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get fields from server: ${error}`);
        }
    }


    return {
        sortedFieldKeys,
        allFields,
        allFieldKeys,
        fieldKeyMap,
    }
}
