import configureMeasurements, { allMeasures } from 'convert-units';


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
            }
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
                    return Math.round(((0.0915 * x) + 2.15) * 10) / 10;
                },
            },
        },
    },
};

const convert = configureMeasurements({
    ...allMeasures,
    glucose,
});

export default convert;