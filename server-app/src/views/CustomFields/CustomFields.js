import { Button, CircularProgress } from '@mui/material';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';
import { usePrompt } from '../../hooks/prompt';
import replace from '../../utils/replace';
import BaseFields from './BaseFields';
import UserDefinedFields from './UserDefinedFields';

const baseDataType = {
    type: '',
    unit: '',
}

export default function CustomFields() {

    const {
        customDataTypes: initialDataTypes = [],
        fetchData,
    } = useCustomDataTypesContext();
    const [loading, setLoading] = useState(false);

    const [customDataTypes, setCustomDataTypes] = useState(initialDataTypes);
    const [dataTypeIdsToDelete, setDataTypeIdsToDelete] = useState([]);

    useEffect(() => {
        setCustomDataTypes(initialDataTypes);
    }, [initialDataTypes])

    const hasChanges = (
        (initialDataTypes.length !== customDataTypes.length)
        ||
        !initialDataTypes.every((dataType, i) => _.isEqual(dataType, customDataTypes[i]))
    );

    const addCustomDataType = () => setCustomDataTypes(dataTypes => [...dataTypes, baseDataType]);
    const updateCustomDataType = (update, index) => setCustomDataTypes(dataTypes => replace(dataTypes, index, { ...dataTypes[index], ...update }));
    const deleteCustomDataType = index => {
        setDataTypeIdsToDelete(idsToDelete => [...idsToDelete, customDataTypes[index]._id].filter(Boolean));
        setCustomDataTypes(dataTypes => dataTypes.filter((_, i) => i !== index));
    };
    const addCustomDataTypeValue = dataTypeIndex => setCustomDataTypes(dataTypes => replace(dataTypes, dataTypeIndex, {
        ...dataTypes[dataTypeIndex],
        values: [...dataTypes[dataTypeIndex].values, ''],
    }));
    const updateCustomDataTypeValue = (update, dataTypeIndex, valueIndex) => setCustomDataTypes(dataTypes => replace(dataTypes, dataTypeIndex, {
        ...dataTypes[dataTypeIndex],
        values: replace(dataTypes[dataTypeIndex].values, valueIndex, update),
    }));
    const deleteCustomDataTypeValue = (dataTypeIndex, valueIndex) => setCustomDataTypes(dataTypes => replace(dataTypes, dataTypeIndex, {
        ...dataTypes[dataTypeIndex],
        values: dataTypes[dataTypeIndex].values.filter((_, i) => i !== valueIndex),
    }));

    usePrompt('You have unsaved changes. Are you sure you want to leave?', hasChanges)

    return (
        <form className='flex w-full max-h-screen px-8 pt-8 pb-16 space-x-8 overflow-auto'
            onSubmit={async e => {
                e.preventDefault();
                setLoading(true);
                try {
                    await window.api.saveCustomDataTypes({
                        customDataTypes,
                        dataTypeIdsToDelete,
                    });
                } catch (error) {
                    console.error("Could not save custom data types");
                }
                fetchData();
                setLoading(false);
            }}
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
            <div className='absolute bottom-4 right-8'>
                <Button
                    type="submit"
                    size="large"
                    color="success"
                    variant="contained"
                    disabled={loading || !hasChanges}
                >
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : null}
                    <span>Save to database</span>
                </Button>
            </div>
        </form>
    )
}
