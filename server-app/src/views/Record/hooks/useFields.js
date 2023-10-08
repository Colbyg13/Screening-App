
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { LOG_LEVEL } from '../../../constants/log-levels';
import { ALL_REQUIRED_DB_FIELD_KEYS, REQUIRED_DB_FIELDS } from '../../../constants/required-station-fields';
import { serverURL } from '../../../constants/server';
import { useSnackBarContext } from '../../../contexts/SnackbarContext';

export default function useFields() {

    const { addSnackBar } = useSnackBarContext();

    const [loading, setLoading] = useState(true);
    const [allFields, setAllFields] = useState([]);

    const allFieldKeys = useMemo(() => allFields.map(({ key }) => key), [allFields]);
    const fieldKeyMap = useMemo(() => allFields.reduce((all, field) => ({
        ...all,
        [field.key]: field,
    }), {}), [allFields]);

    const sortedFieldKeys = useMemo(() => [
        'id',
        ...ALL_REQUIRED_DB_FIELD_KEYS,
        ...allFieldKeys.filter(key => !REQUIRED_DB_FIELDS[key] && (key !== 'id')),
    ], [allFieldKeys]);

    useEffect(() => {
        getFields();
    }, []);

    async function getFields() {
        setLoading(true);
        try {
            const result = await axios.get(`${serverURL}/api/v1/fields`);
            setAllFields(result.data);
        } catch (error) {
            console.error("Could not get fields from server", error);
            addSnackBar({
                title: 'Error',
                message: `Could not get fields from server: ${error}`,
                variant: 'danger',
                timeout: 2500,
            });
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
