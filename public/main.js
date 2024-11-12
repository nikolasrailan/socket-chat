
const socket = io();
let username = '';
let currentRoom = '';

// Elementos da interface
let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');
let loginInput = document.querySelector('#loginNameInput');
let roomSelect = document.querySelector('#roomSelect');  // Seleção de sala
let textInput = document.querySelector('#chatTextInput');

// Inicializa a tela de login
loginPage.style.display = 'flex';
chatPage.style.display = 'none';

// Função para renderizar lista de usuários
function renderUserList(roomUsers) {
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';
    roomUsers.forEach(user => {
        ul.innerHTML += '<li>' + user + '</li>';
    });
}

// Função para adicionar mensagens no chat
function addMessage(type, user, msg) {
    let ul = document.querySelector('.chatList');
    switch (type) {
        case 'status':
            ul.innerHTML += '<li class="m-status">' + msg + '</li>';
            break;
        case 'msg':
            if (username == user) {
                ul.innerHTML += `<li class="m-txt"><span class="me">${user}</span>: ${msg}</li>`;
            } else {
                ul.innerHTML += `<li class="m-txt"><span>${user}</span>: ${msg}</li>`;
            }
            break;
    }
    ul.scrollTop = ul.scrollHeight;
}

// Entrando no chat com o nome de usuário
loginInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        username = loginInput.value.trim();
        if (username !== '') {
            document.title = 'Chat (' + username + ')';
            loginPage.style.display = 'none';
            chatPage.style.display = 'flex';
            roomSelect.style.display = 'block';  // Exibe seleção de salas
            textInput.focus();
        }
    }
});

// Seleção de sala
roomSelect.addEventListener('change', (e) => {
    let room = roomSelect.value;
    if (room !== '' && username !== '') {
        currentRoom = room;
        socket.emit('join-room', room, username);  // Entra na sala
    }
});

// Envio de mensagem
// textInput.addEventListener('keyup', (e) => {
//     if (e.keyCode === 13) {
//         let txt = textInput.value.trim();
//         textInput.value = '';
//         if (txt !== '') {
//             addMessage('msg', username, txt);
//             socket.emit('send-msg', currentRoom, txt);  // Envia a mensagem para a sala
//         }
//     }
// });
textInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let txt = textInput.value.trim();
        textInput.value = '';
        if (txt !== '') {
            // Envia a mensagem para o servidor, mas não a exibe localmente
            socket.emit('send-msg', currentRoom, txt);
        }
    }
});

// Notifica o usuário que ele entrou em uma sala
socket.on('room-joined', (room, users) => {
    addMessage('status', null, 'Você entrou na sala ' + room);
    renderUserList(users);
});

// Notifica os usuários quando alguém entra na sala
socket.on('user-joined', (username, users) => {
    addMessage('status', null, username + ' entrou na sala.');
    renderUserList(users);
});

// Notifica os usuários quando alguém sai da sala
socket.on('user-left', (username, users) => {
    addMessage('status', null, username + ' saiu da sala.');
    renderUserList(users);
});

// Exibe as mensagens enviadas na sala
socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message);
});


