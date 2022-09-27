const express = require('express');
const { asyncPipe } = require('./server/utils');

console.log('-- starting up server --')

asyncPipe(
    express(), // APP
    require('./server/context-bridge'),
    require('./server/middlewares'),
    require('./server/sockets'),
    require('./server/db-connect'),
    require('./server/routes'),
    require('./server/listen'),
);
