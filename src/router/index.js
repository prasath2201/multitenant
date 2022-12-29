import { Router } from "express";
import { getInstance , migartionMiddleware } from '../middleware'

const routes = Router();
const path = require("path");

// auth apis
const authApiNames = require('fs').readdirSync(__dirname + '/auth', { withFileTypes: true })
    .filter((val) => val.isDirectory()).map((item) => item.name)

authApiNames.forEach(async (item) => {
    var route = await require(path.join(__dirname + '/auth', item))
    routes.use(`/${item}/`, route);
})


// public apis
const publicApiNames = require('fs').readdirSync(__dirname + '/public', { withFileTypes: true })
    .filter((val) => val.isDirectory()).map((item) => item.name)

// publicApiNames.forEach(async (item) => {
//     var route = await require(path.join(__dirname + '/public', item))
//     routes.use(`/${item}/`, getInstance, route);
// })


//privateApis
const privateApis = require('fs'
).readdirSync(__dirname + '/private', { withFileTypes: true })
    .filter((val) => val.isDirectory()).map((item) => item.name)

privateApis.forEach(async (item) => {
    var route = await require(path.join(__dirname + '/private', item))
    routes.use(`/${item}/`, getInstance,migartionMiddleware ,route);
})
export default routes;
