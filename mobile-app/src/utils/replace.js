export default function replace(arr, i, val) {
    if (
        (parseInt(i) !== i)
        ||
        (i < 0)
    ) {
        console.warn(arguments);
        console.warn(`replace() index must be a positive integer, received ${i}`);
    }
    const newArr = arr.slice();
    newArr[i] = val;
    return newArr;
};
