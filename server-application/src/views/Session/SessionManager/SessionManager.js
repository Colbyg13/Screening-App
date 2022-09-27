import React from 'react';
import { useSessionContext } from '../../../contexts/SessionContext';
import FieldDataManager from './FieldDataManager';
import StationManager from './StationManager';

export default function SessionManager() {

    const {

    } = useSessionContext();

    return (
        <div className='flex'>
            <div className='h-full w-full bg-green-300'>
                <StationManager />
            </div>
            <div className='h-full w-full bg-blue-300'>
                <FieldDataManager />
            </div>
        </div>
    )
}
