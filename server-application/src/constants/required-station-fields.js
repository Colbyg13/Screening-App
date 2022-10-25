import { SESSION_DATA_TYPES } from "./session-data-types";

const NAME = {
    name: 'Name',
    type: SESSION_DATA_TYPES.STRING,
};
const DOB = {
    name: 'DOB',
    type: SESSION_DATA_TYPES.DATE,
};

export const REQUIRED_STATION_FIELDS = {
    [NAME.name]: NAME,
    [DOB.name]: DOB,
}

export const ALL_REQUIRED_STATION_FIELDS = [
    NAME,
    DOB,
]