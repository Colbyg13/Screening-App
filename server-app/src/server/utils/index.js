const _ = require('lodash')

const normalizeFields = fields =>
    fields.map(field => ({
        ...field,
        key: _.camelCase(field.name.toLowerCase()),
    }))

const removeEmptyValues = obj =>
    Object.fromEntries(
        Object.entries(obj).filter(([_, val]) => !['', undefined, null].includes(val)),
    )

module.exports = {
    normalizeFields,
    removeEmptyValues,
}
