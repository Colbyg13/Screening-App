const _ = require('lodash');

const pipe = (arg, ...callbacks) => callbacks.reduce((val, cb) => cb(val), arg);

const asyncPipe = async (promise, cb, ...callbacks) => {
    const result = await promise;
    const val = cb(result);
    return callbacks.length ?
        asyncPipe(val, ...callbacks)
        :
        val;
};

const tap = cb => arg => {
    cb(arg);
    return arg;
};

const asyncTap = cb => async arg => {
    await cb(arg);
    return arg;
};

const normalizeFields = fields => fields.map(field => ({
    ...field,
    key: _.camelCase(field.name.toLowerCase()),
}))


module.exports = {
    pipe,
    asyncPipe,
    tap,
    asyncTap,
    normalizeFields,
};
