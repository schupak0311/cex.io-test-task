/* eslint-disable no-console */
import socketIOClient from 'socket.io-client';
import colors from 'colors';

const clientB = socketIOClient.connect('http://localhost:3001');

clientB.on('connect', () => {
  console.log('Client B session load initialization...');
  console.log('Client B connected!\n'.green);
  clientB.emit('send-info', { name: 'clientB', id: clientB.id });
});

clientB.on('sessionId', (id) => {
  console.log('Session ID: ' + `${id}\n`);
});

clientB.on('sent', (data) => {
  console.log('\nInitial File CheckSum: ' + data + '\n');
});

clientB.on('end upload', (data) => {
  console.log(data.msg.green);
  console.log('\nResult File CheckSum: ' + data.checkSum);
});
