import {createClient} from 'redis';

import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);
app.use(express.static('trivia_ai_frontend/dist'));

import { Server } from "socket.io";
const io = new Server(server);

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));


const client = createClient({
    socket: {
        host: '10.0.0.43',
        port: '6379'
    }
});
client.on('error', err => console.log('Redis Client Error', err));


app.get("/", async function (req, res) {
    return res.sendFile(__dirname + '/trivia_ai_frontend/dist/index.html');

});


async function sendData() {
    await client.connect();
    const data = await client.json.GET('123456');

    let tests = data.qustionData[0];
    io.emit("send_data", {gData: data, qData: tests});
    await client.disconnect();
}

io.on('connection', async (socket) => {
    // const rooms = io.sockets.adapter.rooms;
    await sendData();


    socket.on('create_game', () => {

        //TODO check if key exists in redis
        const randomNumber = Math.floor(Math.random() * 900000) + 100000;
        console.log(randomNumber);
        
        socket.join(`${randomNumber}`);

    });

    socket.on('join', (data) => {

        socket.join(data.test);
        io.to(data.test).emit("get");
    });

});


server.listen(6060, () => {
    console.log('listening on *:3000');
});

