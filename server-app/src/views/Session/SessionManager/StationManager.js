import { Button, IconButton, Paper } from '@mui/material'
import React, { useState } from 'react'
import { useSessionContext } from '../../../contexts/SessionContext'
import StationFields from './StationFields'
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone'
import FolderIcon from '@mui/icons-material/Folder'
import SessionTemplateModal from './SessionTemplateModal'
import SessionSaveTemplateModal from './SessionSaveTemplateModal'

export default function StationManager() {
    const [openTemplateModal, setOpenTemplateModal] = useState(false)
    const [openSaveTemplateModal, setOpenSaveTemplateModal] = useState(false)

    const { sessionInfo, addStation, deleteStation, addField, updateField, deleteField } =
        useSessionContext()

    return (
        <div className="h-screen flex flex-col p-8 pb-16 items-center overflow-y-scroll">
            <SessionTemplateModal
                open={openTemplateModal}
                onClose={() => setOpenTemplateModal(false)}
            />
            <SessionSaveTemplateModal
                open={openSaveTemplateModal}
                onClose={() => setOpenSaveTemplateModal(false)}
            />
            <Paper className="w-fit rounded-md">
                <div className="flex justify-between items-center px-4 border-b">
                    <h2 className="text-2xl">Templates</h2>
                    <div className="flex space-x-2">
                        <IconButton onClick={() => setOpenTemplateModal(true)}>
                            <FolderIcon style={{ color: 'tan', width: 36, height: 36 }} />
                        </IconButton>
                        <IconButton onClick={() => setOpenSaveTemplateModal(true)}>
                            <FileDownloadDoneIcon
                                style={{ color: 'green', width: 36, height: 36 }}
                            />
                        </IconButton>
                    </div>
                </div>
                <div className=" space-y-4 py-8 px-16">
                    <StationFields
                        isGeneral
                        station={{
                            name: 'General Fields',
                            fields: sessionInfo.generalFields,
                        }}
                        addField={addField}
                        updateField={updateField}
                        deleteField={deleteField}
                    />
                    {sessionInfo.stations.map((station, i) => (
                        <StationFields
                            key={station.id}
                            stationIndex={i}
                            station={station}
                            addField={addField}
                            updateField={updateField}
                            deleteField={deleteField}
                            deleteStation={sessionInfo.stations.length > 1 && deleteStation}
                        />
                    ))}
                    <Button fullWidth color="secondary" variant="outlined" onClick={addStation}>
                        Add Station
                    </Button>
                </div>
            </Paper>
        </div>
    )
}
