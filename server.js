var express = require('express');
var app = express();
var path = require('path')

app.use(express.static(__dirname + "/static"));


var server = app.listen(8000);
var io = require('socket.io').listen(server);

var users = [];

io.sockets.on('connection', function(socket){

  socket.on('newUser', function(userData){
    users.push({
      socketID: socket.id,
      name: userData.userName
    });
    io.emit('updateUserList', users);
    io.emit('updateMessageBoard', {msg: ('<p>'+userData.userName + ' has just joined the room. </p>')});
  })
  socket.on('newMessage', function(userData){
    io.emit('updateMessageBoard', userData );
  })

  socket.on('disconnect', function(){
    for(index in users){
      if(users[index].socketID == socket.id){
        io.emit('updateMessageBoard', {msg: ('<p>'+users[index].name + ' has just left the room.</p>')});
        users.splice(index, 1);
        io.emit('updateUserList', users);

      }
    }
  });

});
