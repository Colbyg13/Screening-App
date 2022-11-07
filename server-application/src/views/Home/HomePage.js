import React from 'react';
import { ROUTES } from '../../components/Navbar/Navbar';
import HomeLinkButton from './HomeLinkButton';

export default function HomePage() {

    return (
        <div className="w-full h-full p-8 flex flex-col space-y-8">
            <h1 className='text-4xl'>Samoa Screening App</h1>
            <div className='flex space-x-4'>
                {[ROUTES.Records, ROUTES.Session, ROUTES.CustomFields, ROUTES.Settings].map(({ title, path }) => (
                    <HomeLinkButton
                        key={title}
                        title={title}
                        to={path}
                    />
                ))}
            </div>
            <div>
                <h2 className='text-2xl'>Instructions:</h2>
                <div className='bg-white w-full h-full'>

                </div>
            </div>
        </div>
    )
}
