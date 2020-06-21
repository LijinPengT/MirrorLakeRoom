
/**
 * 连接socket服务
 */
var socket = io('http://127.0.0.1:8080');


var username, avatar;

/**
 * 登录
 */

 $('#login_avatar li').on('click', function() {
     $(this)
     .addClass('now')
     .siblings()
     .removeClass('now')
 });

 //点击登录

 $('#loginBtn').on('click', function() {
     //获取用户名
     var uname = $('#username').val().trim();
     if(!uname) {
         alert('请输入用户名');
         return
     }

     //获取头像
     var avatar = $('#login_avatar li.now img').attr('src');

     // 告诉socketio服务,登录
     socket.emit('login', {
         username: uname,
         avatar: avatar
     });
 });


// login error
socket.on('loginError', data => {
    alert('Login error');
});

socket.on('loginSuccess', data => {
    // 显示聊天窗口

    //隐藏登录窗口
    $('.login_box').fadeOut();
    $('.container').fadeIn();

    // 设置个人信息
    $('.avatar_url').attr('src', data.avatar);
    $('.info username').text(data.username);

    username = data.username;
    avatar = data.avatar;
});


socket.on('addUser', data => {
    // 添加一条系统消息
    $('.box-bd').append(`
        <div class="system>
            <p class="message_system">
                <span class="content">${data.username} 加入群聊</span>
            </p>
        </div>
    `);

    scrollIntoView();
});


socket.on('userList', data => {
    $('.user-list ul').html('');
    data.forEach(item => {
        $('user-list ul').append(`
            <li class="user">
                <div class="avatar"><img src="${item.avatar}" /></div>
                <div class="name">${item.username}</div>
            </li>
        `);
    });

    $('#userCount').text(data.length);
});

//监听用户离开
socket.on('delUser', data => {
    $('.box-bd').append(`
    <div class="system>
        <p class="message_system">
            <span class="content">${data.username} 离开群聊</span>
        </p>
    </div>
    `);

    scrollIntoView();
});


// 聊天功能
$('.btn-send').on('click', () => {
    //获取聊天内容
    var content = $('#content').val().trim();
    $('#content').val('');
    if(!content) return alert('请输入内容');

    //发送给服务器
    socket.emit('sendMsg', {
        msg: content,
        usernameL: username,
        avatar: avatar
    });
});

// 监听聊天消息
socket.on('receiveMessage', data => {
    // 把接收到的消息显示到聊天框中
    if(data.username === username) {
        //own msg
        $('box-bd').append(`
        <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                ${data.msg}
              </div>
            </div>
          </div>
        </div>
      </div>
      `)
    } else {

    //other msg
    $('box-bd').append(`
    <div class="message-box">
    <div class="other message">
      <img class="avatar" src="${data.avatar}" alt="" />
      <div class="content">
      <div class="nickname>${data.username}</div>
        <div class="bubble">
          <div class="bubble_cont">
            ${data.msg}
          </div>
        </div>
      </div>
    </div>
  </div>
  `)
}

scrollIntoView();
});


function scrollIntoView() {
    // 当前元素的底部滚动到可视区
    $('.box-bd')
      .children(':last')
      .get(0)
      .scrollIntoView(false)
}

$('#file').on('change', function(){
    var file = this.files[0];

    // 把文件发送到服务器,借助fileReader
    var fr = new FileReader()
    fr.readAsDataURL(file);
    fr.onload = function() {
        socket.emit('sendImage', {
            username: username,
            avatar: avatar,
            img: fr.result
        });
    }
});


//监听图片聊天
socket.on('receiveImage', data => {
    // 把接收到的消息显示到聊天框中
    if(data.username === username) {
        //own msg
        $('box-bd').append(`
        <div class="message-box">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
              <img src="${data.img}"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      `)
    } else {

    //other msg
    $('box-bd').append(`
    <div class="message-box">
    <div class="other message">
      <img class="avatar" src="${data.avatar}" alt="" />
      <div class="content">
      <div class="nickname>${data.username}</div>
        <div class="bubble">
          <div class="bubble_cont">
          <img src="${data.img}"/>
          </div>
        </div>
      </div>
    </div>
  </div>
  `)
}

//等待图片加载完成
$('.box-bd img:last').on('load', function() {
    scrollIntoView();
})

});


//表情包
$('.face').on('click', function(){
    $('#content').emoji({
        // 设置触发表情的按钮
        button: '.face',
        showTab: false,
        animation: 'slide',
        position: 'topRight',
        icons: [
        {
            name: 'QQ表情',
            path: 'lib/jquery-emoji/img/qq/',
            maxNum: 91,
            excludeNums: [41, 45, 54],
            file: '.gif'
        }
        ]
    });
});