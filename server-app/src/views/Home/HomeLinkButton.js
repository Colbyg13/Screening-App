import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../components/Navbar/Navbar'

export default function HomeLinkButton({ title, to }) {
    const colorClassName =
        to === ROUTES.Records.path
            ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            : to === ROUTES.Session.path
              ? 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
              : to === ROUTES.CustomFields.path
                ? 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700'
                : 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'

    return (
        <Link
            className={`h-40 flex-1 flex items-center justify-center cursor-pointer rounded-lg shadow-lg ${colorClassName}`}
            to={to}
        >
            <h3 className="text-md sm:text-xl md:text-3xl lg:text-4xl text-white text-center">
                {title}
            </h3>
        </Link>
    )
}
