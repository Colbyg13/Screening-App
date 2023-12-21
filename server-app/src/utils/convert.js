import configureMeasurements, { allMeasures } from 'convert-units';

const baseUnits = {
    acceleration: 'm/s2',
    angle: 'rad',
    apparentPower: 'VA',
    area: 'm2',
    charge: 'c',
    current: 'A',
    digital: 'MB',
    each: 'ea',
    energy: 'J',
    force: 'N',
    frequency: 'MHz',
    glucose: 'mmol/mol',
    illuminance: 'lx',
    length: 'm',
    mass: 'g',
    massFlowRate: 'kg/s',
    pace: 'min/km',
    partsPer: 'ppm',
    pieces: 'pcs',
    power: 'kW',
    pressure: 'Pa',
    reactiveEnergy: 'VARh',
    reactivePower: 'VAR',
    speed: 'km/h',
    temperature: 'C',
    time: 'min',
    voltage: 'V',
    volume: 'm3',
    volumeFlowRate: 'm3/s',
};

const glucose = {
    systems: {
        ngsp: {
            ['HbA1c']: {
                name: {
                    abbr: 'HbA1c',
                    singular: '(HbA1c) Glycated Haemoglobin',
                    plural: '(HbA1c) Glycated Haemoglobins',
                },
                to_anchor: 1,
            },
        },
        ifcc: {
            ['mmol/mol']: {
                name: {
                    abbr: 'mmol/mol',
                    singular: 'mmol/mol - Millimoles per Mole',
                    plural: 'mmol/mol - Millimoles per Moles',
                },
                to_anchor: 1,
            },
        },
    },
    anchors: {
        ngsp: {
            ifcc: {
                transform: function (x) {
                    return Math.round(10.929 * (x - 2.15));
                },
            },
        },
        ifcc: {
            ngsp: {
                transform: function (x) {
                    return Math.round((0.0915 * x + 2.15) * 10) / 10;
                },
            },
        },
    },
};

const convert = configureMeasurements({
    ...allMeasures,
    glucose,
});

export function getBaseUnit(unit) {
    const category = convert().describe(unit).measure;
    const baseUnit = baseUnits[category];

    return baseUnit;
}

export default convert;
