import React from 'react';
import { useSessionContext } from '../../../contexts/SessionContext';
import FieldDataManager from './FieldDataManager';
import StationManager from './StationManager';

export default function SessionManager() {

    const {

    } = useSessionContext();

    return (
        <div className='flex'>
            <div className='w-full'>
                <StationManager />
            </div>
            <div className='w-full'>
                <FieldDataManager />
            </div>
        </div>
    )
}
