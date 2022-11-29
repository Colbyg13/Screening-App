import { TextField } from '@mui/material';
import React from 'react'

export default function Settings() {



    return (
        <div className='flex w-full max-h-screen px-8 pt-8 pb-16 space-x-8 overflow-auto'>
            <div className='py-4 px-8 w-full h-full bg-white rounded-md shadow-md'>
                <h2 className='text-2xl mb-4'>Settings</h2>
                <div className='flex space-x-2 items-center'>
                    <span className='text-lg'>Device Name</span>
                    <TextField
                        disabled
                        className='w-52'
                        size='small'
                        value="Admin"
                    />
                </div>
                <div>
                    <h2 className='text-xl mt-4 mb-2'>Credits</h2>
                    <div>Andrew Giles - andrewgiles@gilezapps.com</div>
                    <div>Colby Gardiner - </div>
                </div>
            </div>
        </div >
    );
}
