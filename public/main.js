//******** CLIENTE *********/

//estabelece conhecao com socket
const socket = io();

//VARIAVEL 
let username = '';
let userList = [];
let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');
let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

//Funcao lista Usuarios
function renderUserList() {
    let ul = document.querySelector('.userList');

    ul.innerHTML = '';

    userList.forEach(i => {
        ul.innerHTML += '<li> '+i+' </li>'
    });
}

//Funcao principal para enviar messagem 
function addMessage(type, user, msg){
    let ul = document.querySelector('.chatList');

    switch(type){
        case 'status':
            ul.innerHTML += '<li class="m-status"> '+msg+' </li>'
        break;

        case 'msg':
        if(username == user){
            ul.innerHTML += '<li class="m-txt"><span class="me">' +user+ '</span> '+msg+' </li>';
        }else{
            ul.innerHTML += '<li class="m-txt"><span>' +user+ '</span> '+msg+' </li>';
        }
        break;
    }
    ul.scrollTo = ul.scrollHeight;
}


//Funcao principal (ENTER) 
loginInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        let name = loginInput.value.trim();

        if(name != '') {
            username = name;
            document.title = 'Chat ('+username+')';

            //quem recebe cliente 
            socket.emit('join-request', username);
        }
    }
});

//funcao mandar uma msg no chat
textInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        let txt = textInput.value.trim();
        textInput.value = '';

        if(txt != ''){
            addMessage('msg', username, txt);
            socket.emit('send-msg', txt);
        }
    }
});


socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Conectado!');

    userList = list;
    renderUserList();
});


//Entrou e saiu  no chat
socket.on('list-update', (data) => {
    
    if(data.joined){
        addMessage('status', null, data.joined + ' entrou no chat');
    }
    if(data.left){
        addMessage('status', null, data.left + ' saiu da sala');
    }
    userList = data.list;
    renderUserList();
});

//Fazendo comunicacao com usuario
socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message);
});

//desconectado  mensagem para cliente
socket.on('disconnect', () => {
    addMessage('status', null, 'Ops! Você foi desconectado!');
    userList = [];
    renderUserList();
});

//tentando reconectar
socket.on('reconnect_error', () => {
    addMessage('status', null, 'Tentando reconectar ...');
});

//reconnectar
socket.on( 'reconectar', () => {
    addMessage('status', null, 'Reaconectado');

    if(username != ''){
        socket.emit('join-request', username);   
    }
});
