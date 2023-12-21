const _ = require('lodash');

const normalizeFields = fields =>
    fields.map(field => ({
        ...field,
        key: _.camelCase(field.name.toLowerCase()),
    }));

module.exports = {
    normalizeFields,
};
