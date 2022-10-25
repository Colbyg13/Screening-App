import React from 'react';
import BaseFields from './BaseFields';
import UserDefinedFields from './UserDefinedFields';


export default function CustomFields() {

    return (
        <div className='flex h-screen px-8 pt-8 pb-16 overflow-auto'>
            <div className='flex-1'>
                <UserDefinedFields />
            </div>
            <div className='flex-1'>
                <BaseFields />
            </div>
        </div>
    )
}
