/**
 * start the chat server
 */

 const express = require('express');
 const app = express();
 const server = require('http').Server(app);
 const io = require('socket.io')(server);

 //记录登陆过的用户
 var users = [];
//express 处理静态资源
//把public设置为静态目录
 app.use(require('express').static('public'));


app.get('/', (req, res) => {
  res.redirect('/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected...');

  socket.on('login', data => {
        //如果用户存在users中,则不允许登录,否则需要登录
        let user = users.find(item => item.username === data.username);
        if(user) {
            // 表示用户存在,登录失败, 服务器反馈信息
            socket.emit('loginError', {msg: 'login error'});
            console.log('Login failed...');
        } else if(data.username) {
            // 用户不存在,登陆成功
            users.push(data);

            //告诉用户,登陆成功
            socket.emit('loginSuccess', data);
            console.log('Login success...');

            // 告诉所有人,有用户加入聊天室
            //socket.emit 告诉当前用户
            // io.emit 告诉所有人
            io.emit('addUser', data)

            //告诉所有用户,聊天室有多少人
            io.emit('userList', users);

            //存储登录成功的用户名和头像
            socket.username = data.username;
            socket.avatar = data.avatar;
        } else {
            socket.emit('loginError', {msg: 'login error'});
            console.log('Login failed...');
        }
  });

  socket.on('disconnect', () => {
      console.log('A user disconnect');
    // 当前用户信息从users删除
    let index = users.findIndex(item => item.username === socket.username);
    users.splice(index, 1);

    //告诉所有人, 有人离开了
    io.emit('delUser', {
        username: socket.username,
        avatar: socket.avatar
    });

    //告诉所有人,userlist发生更新
    io.emit('userList', users);
  });

  socket.on('sendMessage', data => {
        // 广播给所有用户
        io.emit('receiveMessage', data);
  });


  socket.on('sendImage', data => {
    // 广播给所有用户
    io.emit('receiveImage', data);
});

});

server.listen(8080, () => {
    console.log('*server listening on 8080...');
});