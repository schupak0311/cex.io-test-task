/* eslint-disable no-console */
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import colors from 'colors';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import sharedsession from 'express-socket.io-session';

import { generateCheckSum } from './helpers/generateCheckSum.helper';
import { CHUNK_SIZE } from './helpers/constants.helper';

dotenv.config();

const app = express();
const socketServer = http.Server(app);
const io = socketIO(socketServer);

const session = require('express-session')({
  secret: 'my-secret',
  resave: true,
  saveUninitialized: true,
});

app.use(cookieParser());
app.use(session);

io.use(sharedsession(session), cookieParser({}));

const files = {};
const struct = {
  name: null,
  type: null,
  size: 0,
  data: [],
  slice: 0,
};
const clients = [];

io.on('connection', (socket) => {
  socket.join('room');
  socket.on('send-info', (data) => {
    let clientInfo = new Object();
    clientInfo.id = data.id;
    clientInfo.name = data.name;
    clients.push(clientInfo);
  });

  session(socket.handshake, {}, (err) => {
    if (err) {
      return err;
    }
    const session = socket.handshake.session;
    const sid = session.id;

    if (io.engine.clientsCount === 2) {
      io.sockets.in('room').emit('sessionId', sid);
    }

    socket.on('slice upload', (data) => {
      if (data.id !== sid) {
        socket.emit('status', 'Permission denied!'.red);
      }

      if (!files[data.file.name]) {
        files[data.file.name] = Object.assign({}, struct, data.file);
        files[data.file.name].data = [];
      }

      //save the data
      files[data.file.name].data.push(data.file.data);
      files[data.file.name].slice++;

      if (files[data.file.name].slice * CHUNK_SIZE >= files[data.file.name].size) {
        const buffer = Buffer.concat(files[data.file.name].data);
        const checkSum = generateCheckSum(buffer);

        fs.writeFile('./data/test.jpg', buffer, (err) => {
          if (err) {
            console.log(err);
          }
          io.sockets
            .in('room')
            .emit('end upload', { msg: 'File upload succesfully!', checkSum });
        });
      } else {
        let progress = (CHUNK_SIZE * files[data.file.name].slice * 100) / data.file.size;
        socket.emit('status', progress.toFixed());
      }
    });

    socket.on('getInitialCheckSum', (data) => {
      const clientA = clients.find((client) => {
        return client.name === 'clientA';
      });
      clientA.initialCheckSum = data.initialCheckSum;
      io.sockets.in('room').emit('sent', data.initialCheckSum);
    });
  });
});

socketServer.listen(3001, () => {
  console.log(`Server listening on port 3001!\n`);
});
