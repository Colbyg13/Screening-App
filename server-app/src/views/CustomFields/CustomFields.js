import { Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { isEqual } from 'lodash';
import React, { useEffect, useState } from 'react';
import { LOG_LEVEL } from '../../constants/log-levels';
import { serverURL } from '../../constants/server';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';
import { useSnackBarContext } from '../../contexts/SnackbarContext';
import { usePrompt } from '../../hooks/prompt';
import BaseFields from './BaseFields';
import UserDefinedFields from './UserDefinedFields';
import { v4 as uuidv4 } from 'uuid';

const baseDataType = {
    type: '',
    unit: '',
};

export default function CustomFields() {
    const [loading, setLoading] = useState(false);

    const { addSnackBar } = useSnackBarContext();
    const { customDataTypes: initialDataTypes = [], fetchData } = useCustomDataTypesContext();

    const [customDataTypes, setCustomDataTypes] = useState(initialDataTypes);
    const [dataTypeIdsToDelete, setDataTypeIdsToDelete] = useState([]);

    const hasChanges =
        initialDataTypes.length !== customDataTypes.length ||
        !initialDataTypes.every((dataType, i) => isEqual(dataType, customDataTypes[i]));

    usePrompt('You have unsaved changes. Are you sure you want to leave?', hasChanges);

    function addCustomDataType() {
        setCustomDataTypes(dataTypes => [...dataTypes, { ...baseDataType, fakeId: uuidv4() }]);
    }

    function updateCustomDataType(update, index) {
        setCustomDataTypes(dataTypes =>
            dataTypes.with(index, { ...dataTypes[index], ...update }),
        );
    }

    function deleteCustomDataType(index) {
        setDataTypeIdsToDelete(idsToDelete =>
            [...idsToDelete, customDataTypes[index]._id].filter(Boolean),
        );
        setCustomDataTypes(dataTypes => dataTypes.filter((_, i) => i !== index));
    }

    function addCustomDataTypeValue(dataTypeIndex) {
        setCustomDataTypes(dataTypes =>
            dataTypes.with(dataTypeIndex, {
                ...dataTypes[dataTypeIndex],
                values: [...dataTypes[dataTypeIndex].values, ''],
            }),
        );
    }

    function updateCustomDataTypeValue(update, dataTypeIndex, valueIndex) {
        setCustomDataTypes(dataTypes =>
            dataTypes.with(dataTypeIndex, {
                ...dataTypes[dataTypeIndex],
                values: dataTypes[dataTypeIndex].values.with(valueIndex, update),
            }),
        );
    }

    function deleteCustomDataTypeValue(dataTypeIndex, valueIndex) {
        setCustomDataTypes(dataTypes =>
            dataTypes.with(dataTypeIndex, {
                ...dataTypes[dataTypeIndex],
                values: dataTypes[dataTypeIndex].values.filter((_, i) => i !== valueIndex),
            }),
        );
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${serverURL}/api/v1/dataTypes`, {
                customDataTypes: customDataTypes.map(
                    ({ fakeId, ...customDataType }) => customDataType,
                ),
                dataTypeIdsToDelete,
            });
            addSnackBar({
                title: 'Success',
                message: `Custom data types successfully saved`,
                variant: 'success',
                timeout: 2500,
            });
            fetchData();
        } catch (error) {
            console.error('Could not save custom data types.', error);
            addSnackBar({
                title: 'Error',
                message: `Could not save custom data types: ${error}`,
                variant: 'danger',
                timeout: 2500,
            });
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not save custom data types: ${error}`);
        }
        setLoading(false);
    }

    useEffect(() => {
        setCustomDataTypes(initialDataTypes);
    }, [initialDataTypes]);

    return (
        <form
            className="flex w-full max-h-screen px-8 pt-8 pb-16 space-x-8 overflow-auto"
            onSubmit={handleSubmit}
        >
            <div className="h-full">
                <UserDefinedFields
                    customDataTypes={customDataTypes}
                    addCustomDataType={addCustomDataType}
                    updateCustomDataType={updateCustomDataType}
                    deleteCustomDataType={deleteCustomDataType}
                    addCustomDataTypeValue={addCustomDataTypeValue}
                    updateCustomDataTypeValue={updateCustomDataTypeValue}
                    deleteCustomDataTypeValue={deleteCustomDataTypeValue}
                />
            </div>
            <BaseFields />
            <div className="absolute bottom-4 right-8">
                <Button
                    type="submit"
                    size="large"
                    color="success"
                    variant="contained"
                    disabled={loading || !hasChanges}
                >
                    {loading ? <CircularProgress size={24} /> : null}
                    <span>Save to database</span>
                </Button>
            </div>
        </form>
    );
}
