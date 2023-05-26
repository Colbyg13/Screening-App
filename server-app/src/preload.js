const express = require('express');
const { asyncPipe } = require('./server/utils');
const { setup } = require('./server/setup');

console.log('-- starting up server --')

setup();

asyncPipe(
    express(), // APP
    require('./server/middlewares'),
    require('./server/sockets'),
    require('./server/db-connect'),
    require('./server/routes'),
    require('./server/listen'),
    require('./server/context-bridge'),
);