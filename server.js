

const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

app.use(express.static(path.join(__dirname, 'public')));

let rooms = {}; // Objeto para armazenar salas e os usuários conectados

io.on('connection', (socket) => {
    console.log("Novo usuário conectado");

    // Quando um usuário entra em uma sala
    socket.on('join-room', (room, username) => {
        socket.join(room);  // O usuário entra na sala especificada
        socket.username = username;  // Salva o nome do usuário
        rooms[room] = rooms[room] || []; // Cria a sala se não existir
        rooms[room].push(username); // Adiciona o usuário à sala

        // Notifica o usuário sobre a entrada na sala
        socket.emit('room-joined', room, rooms[room]);

        // Notifica todos na sala sobre a entrada do usuário
        socket.to(room).broadcast.emit('user-joined', username, rooms[room]);
    });

    // Quando um usuário envia uma mensagem
    socket.on('send-msg', (room, msg) => {
        const message = {
            username: socket.username,
            message: msg
        };
        // Envia a mensagem apenas para os usuários da sala
        io.to(room).emit('show-msg', message);
    });

    // Quando um usuário desconecta
    socket.on('disconnect', () => {
        for (let room in rooms) {
            // Remove o usuário da sala
            rooms[room] = rooms[room].filter(user => user !== socket.username);
            if (rooms[room].length > 0) {
                socket.to(room).broadcast.emit('user-left', socket.username, rooms[room]);
            }
        }
    });
});

