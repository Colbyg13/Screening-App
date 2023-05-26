const path = require("path");
const { app } = window.require('@electron/remote')

const appDataPath = app.getPath("appData");
const applicationName = 'HealthySamoa';
const applicationPath = path.join(appDataPath, applicationName);
const logsPath = path.join(applicationPath, "logs");

console.log({
    appDataPath,
    applicationName,
    applicationPath,
    logsPath,
})

module.exports = {
    applicationPath,
    logsPath,
}