import React, { useEffect, useState } from 'react'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';
import { Menu, MenuItem } from '@mui/material';
import convert from 'convert-units';

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
                {anchorEl && convert().from(console.log({id: anchorEl.id, unitConversions}) || unitConversions[anchorEl?.id]).possibilities().map(unit => (
                    <MenuItem onClick={() => {
                        updateFieldUnit(anchorEl.id, unit);
                        handleClose();
                    }}>{unit}</MenuItem>
                ))}
            </Menu>
        </>
    )
}
