export default function replace(arr, i, val) {
    if (parseInt(i) !== i || i < 0) {
        console.error(arguments);
        throw new TypeError(`replace() index must be a positive integer, received ${i}`);
    }
    const newArr = arr.slice();
    newArr[i] = val;
    return newArr;
}
