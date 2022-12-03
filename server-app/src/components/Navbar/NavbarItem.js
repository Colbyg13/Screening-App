import { Badge, ListItem } from '@mui/material';
import React from 'react';

export default function NavbarItem({
    open,
    Icon,
    title,
    selected,
    displayBadge,
    onClick,
}) {

    return (
        <ListItem
            key={title}
            selected={selected}
            button
            onClick={onClick}
        >
            <div className='flex items-center space-x-2'>
                <Icon />
                {open ? (
                    <span>{title}</span>
                ) : null}
                {displayBadge ? (
                    <Badge variant="dot" overlap="circular" color="success" />
                ) : null}
            </div>
        </ListItem>
    );
}
