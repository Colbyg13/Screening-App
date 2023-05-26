const fs = require("fs");
const {
    applicationPath,
    logsPath,
} = require("./consts/paths")

function setup() {
    // sets up file system
    // ROOT
    console.log("Checking application exists", applicationPath)
    if (!fs.existsSync(applicationPath)) {
        console.log("Making App dir...")
        fs.mkdirSync(applicationPath)
    }
    // LOGS
    console.log("Checking application Logs exists", logsPath)
    if (!fs.existsSync(logsPath)) {
        console.log("Making Logs dir...")
        fs.mkdirSync(logsPath)
    }
}

module.exports = {
    setup,
}