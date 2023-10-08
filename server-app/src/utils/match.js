
const invokeIfCallback = (cb, ...args) => typeof cb === 'function' ?
    cb(...args)
    :
    cb;

const matched = result => ({
    on: () => matched(result),
    case: () => matched(result),
    equals: () => matched(result),
    in: () => matched(result),
    regex: () => matched(result),
    against: () => matched(result),
    otherwise: () => result,
    finally: () => {
        throw new Error(`Must use \`otherwise()\` before using finally()`);
    },
});

const match = (...inputs) => ({
    on: (predicate, cb) => predicate(...inputs) ?
        matched(invokeIfCallback(cb, ...inputs))
        :
        match(...inputs),
    case: (condition, cb) => condition ?
        matched(invokeIfCallback(cb, ...inputs))
        :
        match(...inputs),
    equals: (...args) => inputs.length === 1 ?
        inputs[0] === args[0] ?
            matched(invokeIfCallback(args[1], ...inputs))
            :
            match(...inputs)
        :
        inputs.every((input, i) => input === args[i]) ?
            matched(invokeIfCallback(args[args.length - 1], ...inputs))
            :
            match(...inputs),
    in: (array, cb) => inputs.every(input => array.includes(input)) ?
        matched(invokeIfCallback(cb, ...inputs))
        :
        match(...inputs),
    regex: (...args) => inputs.length === 1 ?
        inputs[0].match(args[0]) ?
            matched(invokeIfCallback(args[1], ...inputs))
            :
            match(...inputs)
        :
        inputs.every((input, i) => input.match(args[i])) ?
            matched(invokeIfCallback(args[args.length - 1], ...inputs))
            :
            match(...inputs),
    against: obj => Object.entries(obj)
        .reduce(
            (acc, [key, cb]) => acc.case(`${inputs[0]}` === key, () => invokeIfCallback(cb, ...inputs.slice(1))),
            match(`${inputs[0]}`, ...inputs.slice(1))
        ),
    otherwise: cb => invokeIfCallback(cb, ...inputs),
    finally: () => {
        throw new Error(`Must use \`otherwise()\` before using finally()`);
    },
});

export default match;