//******** SERVIDOR *********/

const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3333);

app.use(express.static(path.join(__dirname, 'public')));

let connectionUsers = [];


//escurador de connection 
io.on('connection', (socket) => {
    console.log(" Conexão detectada .... ");

    //envia para socketr 
    socket.on('join-request', (username) => {
        socket.username = username;
        connectionUsers.push(username);
        console.log(connectionUsers);

        //responder para cliente
        socket.emit('user-ok', connectionUsers);
        
        //quem entrou 
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectionUsers
        });
    });


    //disconnect
    socket.on('disconnect', () => {
        connectionUsers = connectionUsers.filter(u => u != socket.username);
        console.log(connectionUsers);

        //quem saiu 
        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectionUsers
        })
    });

    //enviar mensagem para galera  
    socket.on('send-msg', (txt) => {
        let obj = {
            username: socket.username,
            message: txt
        };

        //socket.emit('show-msg', obj);
        socket.broadcast.emit('show-msg', obj);

    });

});