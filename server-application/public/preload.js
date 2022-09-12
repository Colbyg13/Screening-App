// TODO: See if we need this because we are using react already
const { contextBridge } = require("electron");
const ip = require('ip');


// This is the pace where we can access node resources for the computer like fs etc...

contextBridge.exposeInMainWorld("api", {
    apiExample: () => {
        console.log('You just used the example API')
        return 1;
    },
    getIP: ip.address,
});
