
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { LOG_LEVEL } from '../../../constants/log-levels';
import { ALL_REQUIRED_STATION_FIELD_KEYS, REQUIRED_STATION_FIELDS } from '../../../constants/required-station-fields';
import { serverURL } from '../../../constants/server';

export default function useFields() {

    const [loading, setLoading] = useState(true);
    const [allFields, setAllFields] = useState([]);

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
        getFields();
    }, []);

    async function getFields() {
        setLoading(true);
        try {
            const result = await axios.get(`${serverURL}/api/v1/fields`);
            console.log({ result });
            setAllFields(result.data);
        } catch (error) {
            console.error("Could not get fields from server", error);
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get fields from server: ${error}`);
        }
        setLoading(false);
    }

    return {
        loading,
        sortedFieldKeys,
        allFields,
        allFieldKeys,
        fieldKeyMap,
    }
}
