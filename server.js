const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3001, () => {
    console.log('Servidor rodando na porta 3001');
});

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];

io.on('connection', (socket) => {
    console.log('Conexão detectada');
    
    socket.on('join-request', (username) => {
        socket.username = username;
        connectedUsers.push(username);
        console.log(connectedUsers); // Exibe a lista de usuários conectados
    
        // Envia uma confirmação para o usuário que se conectou
        socket.emit('user-ok', connectedUsers);
    
        // Envia a atualização da lista para todos, exceto o usuário que se conectou
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        });
    });
    

    // Quando o usuário desconectar
    socket.on('disconnect', () => {
        // Remove o usuário da lista de conectados
        connectedUsers = connectedUsers.filter(u => u !== socket.username);
        console.log(connectedUsers); // Exibe a lista de usuários após a desconexão

        // Notifica todos os outros usuários que alguém saiu
        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });
    });

    // Quando o usuário envia uma mensagem
    socket.on('send-msg', (txt) => {
        const obj = {
            username: socket.username,
            message: txt
        };

        // Envia a mensagem para todos, exceto o usuário que a enviou
        socket.broadcast.emit('show-msg', obj);
    });
});