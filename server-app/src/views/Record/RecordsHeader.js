import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Menu, MenuItem } from '@mui/material';
import React, { useEffect, useState } from 'react';
import convert from '../../utils/convert';

export default function RecordsHeader({
    mainSortKey,
    allFieldKeys = [],
    fieldKeyMap = {},
    sort = {},
    unitConversions = {},
    updateFieldUnit = () => { },
    updateSortArray = () => { },
}) {

    const [anchorEl, setAnchorEl] = useState(null);
    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        const openMenu = e => {
            let node = e.target;
            while (node && node.tagName !== 'TH') {
                node = node.parentNode;
            }
            if (node && unitConversions[node.id]) setAnchorEl(node);
            else setAnchorEl();
        }

        window.addEventListener('contextmenu', openMenu);

        return () => {
            window.removeEventListener('contextmenu', openMenu);
        }
    }, [unitConversions]);

    return (
        <>
            <thead className='py-2 h-10 min-h-fit sticky top-0 bg-white shadow-lg'>
                <tr className=''>
                    {allFieldKeys.map(key => (
                        <th id={key} key={key} className={`px-4 py-3 text-start hover:bg-gray-100 cursor-pointer shadow-inner ${mainSortKey === key ? 'text-blue-500' : ''}`}
                            onClick={() => updateSortArray(key)}
                        >
                            <div className='flex space-x-1 items-center'>
                                <span>{fieldKeyMap[key]?.name || key}</span>
                                <span>{unitConversions[key] ? `(${unitConversions[key]})` : ''}</span>
                                {sort[key] < 0 ? (
                                    <ArrowDropDownIcon size={12} />
                                ) : (
                                    <ArrowDropUpIcon />
                                )}
                            </div>
                        </th>
                    ))}
                    <th className='w-full' />
                </tr>
            </thead>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {anchorEl && convert().from(unitConversions[anchorEl?.id]).possibilities().map(unit => (
                    <MenuItem key={unit} onClick={() => {
                        updateFieldUnit(anchorEl.id, unit);
                        handleClose();
                    }}>{unit}</MenuItem>
                ))}
            </Menu>
        </>
    )
}
