import React from 'react'

export default function NavbarItem({
    open,
    Icon,
    title,
    selected,
    onClick,
}) {

    return (
        <div className={`px-2 py-1 flex w-full space-x-2 ${selected ? 'bg-gray-300' : ''}`}
            onClick={onClick}
        >
            <Icon />
            {open ? (
                <span>{title}</span>
            ) : null}
        </div>
    )
}
