# Test task for NodeJs developer

## Description
Develop a system of three components (Client A, Client B, Server):
1. Server - serves the requests of Client A and Client B
2. Client A - sends the data file to the server.
3. Client B - monitors and verifies the sending of data. 

    Step-by-step description of the interaction of system components: 

    1. Client application B makes a request to initialize a data loading session, the Server returns a session identifier. 
    2. Client B establishes a long-lived connection with the Server (Server-Sent Events / Long-polling / WebSocket) to receive        an update of the status of the data loading process by session ID.
    3. Client A uploads data to the Server in several (> 1) parts. At the same time, it transmits the session identifier              obtained in step 1.
    4. After downloading all parts of the data, the Server sends to Client B through a long-lived connection the update of the        download status (completed) and the checksum for the received file.
    5. Client B reconciles the checksum of the file.
    
## Installation 

`npm install`

`npm start`
   
    
## Screenshot Running App

![](https://i.imgur.com/G56ygJc.png)
