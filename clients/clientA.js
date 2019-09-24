/* eslint-disable no-console */
import socketIOClient from 'socket.io-client';
import colors from 'colors';
import FileAPI from 'file-api';
import FileReader from 'filereader';

import { generateCheckSum } from '../helpers/generateCheckSum.helper';
import { getFileSizeInBytes } from '../helpers/getFileSizeInBytes.helper';
import { CHUNK_SIZE } from '../helpers/constants.helper';

const File = FileAPI.File;
const clientA = socketIOClient.connect('http://localhost:3001');

clientA.on('connect', () => {
  console.log('Client A connected!\n'.green);
  clientA.emit('send-info', { name: 'clientA', id: clientA.id });
});

clientA.on('sessionId', (id) => {
  const fileReader = new FileReader();
  const file = new File('./data/adorable-animal-blur-406014.jpg');
  const fileSize = getFileSizeInBytes('./data/adorable-animal-blur-406014.jpg');
  fileReader.setNodeChunkedEncoding(true);
  fileReader.readAsArrayBuffer(file);
  console.log('Start of Uploading File...\n'.cyan);
  const chunks = fileSize / CHUNK_SIZE;
  console.log(`Dividing file into ${Math.floor(chunks)} chunks...\n`.yellow);
  fileReader.on('data', function(data) {
    clientA.emit('slice upload', {
      id,
      file: {
        name: file.name,
        type: file.type,
        size: fileSize,
        data: data,
      },
    });
  });

  fileReader.onload = () => {
    clientA.emit('getInitialCheckSum', {
      sid: clientA.id,
      initialCheckSum: generateCheckSum(fileReader.result),
    });
  };
});

clientA.on('status', (data) => {
  console.log('File uploaded on' + ` ${data}%`.green);
});
