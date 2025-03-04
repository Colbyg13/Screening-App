export const PATIENT_RECORD_STATUS = {
    COMPLETE: 'Complete',
    PARTIAL: 'Partial',
    NONE: 'None',
};

export default class PatientRecord {
    constructor(patientRecord, stationList = []) {
        Object.assign(this, patientRecord);
        this.progress = stationList.map(({ fields }) => {
            if (fields.every(({ key }) => isEmpty(patientRecord[key])))
                return PATIENT_RECORD_STATUS.COMPLETE;
            if (fields.some(({ key }) => isEmpty(patientRecord[key])))
                return PATIENT_RECORD_STATUS.PARTIAL;
            return PATIENT_RECORD_STATUS.NONE;
        });
    }

    get nextStationIndex() {
        const nextStationIndex = this.progress.findIndex(status => status !== PATIENT_RECORD_STATUS.COMPLETE);
        if (nextStationIndex === -1) {
            return this.progress.length;
        }

        return nextStationIndex;
    }

    get nextStationStatus() {
        return this.progress[this.nextStationIndex] ?? PATIENT_RECORD_STATUS.COMPLETE;
    }

    get isComplete() {
        return this.nextStationIndex === this.progress.length;
    }
}

function isEmpty(value) {
    return value !== '' && value !== undefined && value !== null && value !== NaN;
}
