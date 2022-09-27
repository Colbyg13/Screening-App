import React from 'react'

export default function NavbarItem({
    open,
    Icon,
    title,
    selected,
    subsection,
    onClick,
}) {

    return (
        <div className={`px-2 py-1 flex w-full space-x-2 hover:bg-gray-200 cursor-pointer ${selected ? 'bg-gray-300' : ''}`}
            onClick={onClick}
        >
            <Icon />
            {open ? (
                <div className='relative'>
                    <span>{title}</span>
                    <div className='absolute top-1 -right-2'>{subsection}</div>
                </div>
            ) : null}
        </div>
    )
}
