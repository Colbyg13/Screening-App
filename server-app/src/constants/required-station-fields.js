import { SESSION_DATA_TYPES } from './session-data-types';
//name is required to be part of station 1 normally.
const NAME = {
    name: 'Name',
    type: SESSION_DATA_TYPES.STRING,
    key: 'name',
};

const CREATED_AT = {
    name: 'Created At',
    type: SESSION_DATA_TYPES.DATE,
    key: 'createdAt',
};

export const REQUIRED_STATION_FIELDS = {
    [NAME.key]: NAME,
};

export const REQUIRED_DB_FIELDS = {
    [CREATED_AT.key]: CREATED_AT,
    [NAME.key]: NAME,
};

export const ALL_REQUIRED_STATION_FIELDS = Object.values(REQUIRED_STATION_FIELDS);

export const ALL_REQUIRED_DB_FIELDS = Object.values(REQUIRED_DB_FIELDS);

export const ALL_REQUIRED_STATION_FIELD_KEYS = ALL_REQUIRED_STATION_FIELDS.map(({ key }) => key);

export const ALL_REQUIRED_DB_FIELD_KEYS = ALL_REQUIRED_DB_FIELDS.map(({ key }) => key);
