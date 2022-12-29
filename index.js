import express from "express";
import { connectAllDB } from './db/dbConnection'
import routers from "./src/router";


const server = express();

const PORT = process.env.PORT;

connectAllDB()

// For parsing application/json
server.use(express.json());
server.use("/api/v1", routers);


server.get("/", async (req, res) => {
    res.status(200).send('server connected successfully');
});

server.listen(PORT, async (req, res) => {
    console.log('server connected successfully')
})