import { SESSION_DATA_TYPES } from "./session-data-types";
//name is required to be part of station 1 normally. 
const NAME = {
    name: 'Name',
    type: SESSION_DATA_TYPES.STRING,
    key: 'name',
};
const DOB = {
    name: 'DOB',
    type: SESSION_DATA_TYPES.DATE,
    key: 'dob',
};

export const REQUIRED_STATION_FIELDS = {
    [NAME.key]: NAME,
    // [DOB.key]: DOB,
};

export const ALL_REQUIRED_STATION_FIELDS = [
    NAME,
    // DOB,
];

export const ALL_REQUIRED_STATION_FIELD_KEYS = ALL_REQUIRED_STATION_FIELDS.map(({ key }) => key);