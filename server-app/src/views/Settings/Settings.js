import { Button, FormControlLabel, TextField } from '@mui/material';
import Switch from '@mui/material/Switch';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { useSessionContext } from '../../contexts/SessionContext';

export default function Settings() {
    const [showDeleteRecordModal, setShowDeleteRecordModal] = useState(false);
    const [showFactoryResetModal, setShowFactoryResetModal] = useState(false);
    const { sessionIsRunning } = useSessionContext();

    const [preventSleep, setPreventSleep] = useState(true);

    const [ipState, setIPState] = useState({
        ip: '',
        ipError: '',
        loading: true,
    });

    useEffect(() => {
        setIPState({ ip: '', ipError: '', loading: true });
        try {
            const ip = window.api.getIP();
            setIPState({ ip, ipError: '', loading: false });
        } catch (error) {
            setIPState({ ip: '', ipError: 'Could not get ip from server', loading: false });
            console.error('Could not get ip from server', error);
        }
    }, []);

    useEffect(() => {
        async function getPreventSleep() {
            try {
                const preventSleep = await window.api.getPreventSleep();
                setPreventSleep(preventSleep);
            } catch (err) {
                console.error(`Could not get prevent sleep value ${err}`);
            }
        }

        getPreventSleep();
    }, []);

    return (
        <div className="flex w-full max-h-screen px-8 pt-8 pb-16 space-x-8 overflow-auto">
            <ConfirmModal
                open={showDeleteRecordModal}
                message="Are you sure you want to delete all records?"
                onClose={() => setShowDeleteRecordModal(false)}
                onSubmit={() => {
                    try {
                        window.api.deleteAllRecordsAndSessions();
                    } catch (error) {
                        console.error('Could not delete all records and sessions', error);
                    }
                }}
                title="Delete All Records"
                actionText="Delete"
                deadmanText="delete"
            />
            <ConfirmModal
                open={showFactoryResetModal}
                message="Are you sure you want to Factory Reset?"
                onClose={() => setShowFactoryResetModal(false)}
                onSubmit={() => {
                    try {
                        window.api.factoryReset();
                    } catch (error) {
                        console.error('Could not complete the factory reset', error);
                    }
                }}
                title="Factory Reset"
                actionText="Reset"
                deadmanText="reset"
            />
            <div className="py-4 px-8 w-full h-full bg-white rounded-md shadow-md">
                <h2 className="text-2xl mb-4">Settings</h2>
                <div className="flex space-x-2 items-center">
                    <span className="text-lg">Device Name</span>
                    <TextField disabled className="w-52" size="small" value="Server Computer" />
                </div>
                <div>
                    <h2 className="text-xl mt-4 mb-2">Device Connection</h2>
                    {ipState.loading ? (
                        <div>Loading...</div>
                    ) : ipState.ipError ? (
                        <div className="text-red-600">{ipState.ipError}</div>
                    ) : (
                        <QRCodeSVG value={`exp://${ipState.ip}:8081`} />
                    )}
                </div>
                <div>
                    <h2 className="text-xl mt-4 mb-2">Device Settings</h2>
                    <FormControlLabel
                        control={
                            <Switch
                                name="disable-sleep"
                                inputProps={{ 'aria-label': 'controlled' }}
                                checked={preventSleep}
                                onChange={e => {
                                    const preventSleep = e.target.checked;
                                    setPreventSleep(preventSleep);
                                    window.api.setPreventSleep(preventSleep);
                                }}
                            />
                        }
                        label="Disable Computer Sleeping"
                    />
                </div>
                <div>
                    <h2 className="text-xl mt-4 mb-2">Server Logs</h2>
                    <Button
                        type="button"
                        size="large"
                        color="primary"
                        variant="contained"
                        onClick={async () => {
                            try {
                                const logsPath = await window.api.getLogsPath();
                                window.api.openFile(logsPath);
                            } catch (error) {
                                console.error(`Could not open logs file ${error}`);
                            }
                        }}
                    >
                        <span>Open Logs</span>
                    </Button>
                </div>
                <div>
                    <h2 className="text-xl mt-4 mb-2 text-red-600">Danger Zone</h2>
                    {sessionIsRunning ? (
                        <div className="text-red-600">
                            Cannot delete records while session is running.
                        </div>
                    ) : null}
                    <div className="flex flex-col space-y-2 w-60">
                        <Button
                            type="button"
                            size="large"
                            color="error"
                            variant="contained"
                            onClick={() => setShowDeleteRecordModal(true)}
                            disabled={sessionIsRunning}
                        >
                            <span>Delete All Records</span>
                        </Button>
                        <Button
                            type="button"
                            size="large"
                            color="error"
                            variant="contained"
                            onClick={() => setShowFactoryResetModal(true)}
                            disabled={sessionIsRunning}
                        >
                            <span>Factory Reset</span>
                        </Button>
                    </div>
                    <div>
                        <h2 className="text-xl mt-4 mb-2">Developers</h2>
                        <div>Andrew Giles - andrewgiles@gilezapps.com</div>
                        <div>Colby Gardiner - colbygardiner13@gmail.com</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
