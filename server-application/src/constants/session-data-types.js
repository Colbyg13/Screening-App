
const STRING = 'string';
const NUMBER = 'number';
const BOOL = 'bool';
const DATE = 'date';

export const SESSION_DATA_TYPES = {
    STRING,
    NUMBER,
    BOOL,
    DATE,
}

export const SESSION_DATA_TYPE_LABELS = {
    [SESSION_DATA_TYPES.STRING]: 'Text',
    [SESSION_DATA_TYPES.NUMBER]: 'Number',
    [SESSION_DATA_TYPES.BOOL]: 'Yes/No',
    [SESSION_DATA_TYPES.DATE]: 'Date',
}

export const ALL_SESSION_DATA_TYPES = Object.values(SESSION_DATA_TYPES);