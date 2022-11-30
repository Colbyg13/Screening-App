const express = require('express');
const { asyncPipe } = require('./utils');

asyncPipe(
    express(), // APP
    require('./middlewares'),
    require('./db-connect'),
    require('./context-bridge'),
    require('./routes'),
    require('./listen'),
);
