const express = require("express");
const cors = require('cors');

module.exports = APP => {

    APP.use(cors());
    APP.use(express.json());

    console.log('-- completed middlewares --');

    return APP;
}