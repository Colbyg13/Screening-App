
export const PATIENT_RECORD_STATUS = {
    COMPLETE: 'Complete',
    PARTIAL: 'Partial',
    NONE: 'None',
}

export default class PatientRecord {
    constructor(patientRecord, stationList = []) {
        Object.assign(this, patientRecord);
        this.progress = stationList.map(({ fields }) => {
            if (fields.every(({ key }) => patientRecord[key] !== undefined)) return PATIENT_RECORD_STATUS.COMPLETE;
            if (fields.some(({ key }) => patientRecord[key] !== undefined)) return PATIENT_RECORD_STATUS.PARTIAL;
            return PATIENT_RECORD_STATUS.NONE;
        });
    }

    get nextStationIndex() {
        return this.progress.findIndex(status => status !== PATIENT_RECORD_STATUS.COMPLETE);
    }

    get nextStationStatus(){
        return this.progress[this.nextStationIndex];
    }

    get isComplete() {
        return this.nextStationIndex === -1;
    }
}