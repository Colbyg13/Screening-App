import React, { useEffect, useState } from 'react'
import { ROUTES } from '../../components/Navbar/Navbar'
import HomeLinkButton from './HomeLinkButton'
import img from '../../assets/healthylogo.png'
import { useSessionContext } from '../../contexts/SessionContext'

export default function HomePage() {
    const { isConnectedToDB } = useSessionContext()

    return (
        <div className="w-full h-full overflow-y-auto pb-16 p-8 flex flex-col space-y-8">
            <div className="flex space-x-4">
                {[ROUTES.CustomFields, ROUTES.Session, ROUTES.Records, ROUTES.Settings].map(
                    ({ title, path }) => (
                        <HomeLinkButton key={title} title={title} to={path} />
                    ),
                )}
            </div>
            {isConnectedToDB ? null : (
                <div className="p-2 bg-red-500 text-white">
                    <span>Could not connect to MongoDB. Make sure you have it downloaded: </span>
                    <span className="text-sky-300 underline">
                        https://www.mongodb.com/try/download/community
                    </span>
                </div>
            )}
            <div className="bg-white w-full h-full p-4 space-y-4 rounded-md shadow-md">
                <div className="flex items-baseline justify-between">
                    <h2 className="text-2xl font-semibold">
                        Welcome to Healthy Samoa's Server Application
                    </h2>
                    <img className="h-16 mr-8" src={img} alt="healthy samoa app" />
                </div>
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold">Custom Fields:</h2>
                    <span>
                        This page is used to define specific fields that will be tracked during the
                        screening option. This allows the application to do unit conversion such as
                        meters to feet or kilograms to pounds.
                    </span>
                    <div className="ml-4 flex flex-col">
                        <span>
                            Type - This is the name of the field. (ex. Height, Weight, Eyes, etc...)
                        </span>
                        <span>
                            Unit - This is the unit the field will be measured with (ex. kg, m,
                            etc...)
                        </span>
                        <span>
                            Values - This is only used if using the "Custom" Unit. This will be a
                            set of defined values that will be selectable for the field (ex. For a
                            type of "Eyes", values will be: 20/20, 20/25, 20/30, etc...)
                        </span>
                    </div>
                </div>
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold">Sessions:</h2>
                    <span>
                        The sessions page is used to define the information that will be tracked
                        during the screening process.
                    </span>
                    <div className="ml-4 flex flex-col">
                        <span>
                            General Fields - These are session based values that will appear on
                            every record for the session.
                        </span>
                        <div className="ml-4 flex flex-col">
                            <span>
                                Field - This is the name of the field that we are keeping track of
                                (ex. Village, School, etc...)
                            </span>
                            <span>
                                Value - This is the actual name for the field we are looking at (For
                                a field value of "Village", values will be: Salelologa, Falealupo,
                                etc...)
                            </span>
                        </div>
                        <span>
                            Stations - This is where stations are defined. Stations have fields that
                            can be added or removed. Station 1 will always keep track of name and
                            birthday.{' '}
                        </span>
                        <div className="ml-4 flex flex-col">
                            <span>
                                Field - This is the name of the field that we are keeping track of
                                (ex. Gender, Eyes, etc...)
                            </span>
                            <span>
                                Type - This is the type the field will be. It can be a base type
                                (Text, Number, Yes/No, Date) or can be a custom type defined in the
                                "Custom Fields" page.
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold">Records:</h2>
                    <span>
                        This page is where you can view all the records and information during
                        screening.
                    </span>
                    <div className="ml-4 flex flex-col">
                        <span>
                            Export Button - All records can be downloaded into a spreadsheet format.
                        </span>
                        <span>
                            Search Bar - Searching is currently done based on id and name. If there
                            are matches, the text will be highlighted to match the search
                        </span>
                        <span>
                            Header - Each column can be pressed to sort the records by that type.
                        </span>
                        <span>Row - Each row can be clicked and edited if needed.</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
