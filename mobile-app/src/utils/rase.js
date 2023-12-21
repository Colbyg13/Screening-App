export default async function promiseRace(promises, rejectMsg, timeout = 5000) {
    return Promise.race([
        ...promises,
        new Promise(function (resolve, reject) {
            setTimeout(function () {
                reject(rejectMsg);
            }, timeout);
        }),
    ]);
}
