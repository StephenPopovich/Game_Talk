<<<<<<< HEAD
var express = require('express'),
  app = express(),
  mongoose = require('mongoose'),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  bodyParser = require("body-parser"),
  users = {};


app.use(bodyParser.urlencoded());

server.listen(8000);

mongoose.connect('mongodb://localhost/chat', function(err){
    if(err){
      console.log(err);
    }else{
      console.log('Connected to mongodb');
    }
});

var chatSchema = mongoose.Schema({
  nick: String,
  msg: String,
  created: {type: Date, default: Date.now}
});

// Validations
chatSchema.path('nick').required(true, 'Type something a nickname!');
chatSchema.path('msg').required(true, 'Type something!');
//model
var Chat = mongoose.model('Message', chatSchema);

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');

});

io.sockets.on('connection', function(socket){
  var query = Chat.find({});
  query.sort('-created').limit(16).exec(function(err, docs){
    if(err) throw err;
    console.log("sending old messages");
    socket.emit('load old msgs', docs);
  });

  socket.on('new user', function(data, callback){
    if (data in users){
      callback(false);
    }else{
      callback(true);
      socket.nickname = data;
      users[socket.nickname] = socket;
      updateNicknames();
    }
  });

  function updateNicknames(){
    io.sockets.emit('usernames', Object.keys(users));
  }

  socket.on('send message', function(data, callback){
    var msg = data.trim();
    if(msg.substr(0,3) === '/w '){
      msg = msg.substr(3);
      var ind = msg.indexOf(' ');
      if(ind !== -1){
        var name = msg.substring(0, ind);
        var msg = msg.substring(ind + 1);
        if(name in users){
          users[name].emit('whisper', {msg: msg, nick: socket.nickname});
          console.log('message sent is: ' + msg);
          console.log('whisper!');
        }else{
          callback('Error! Enter a valid user in chatroom.');
        }

      }else{
         callback('Error! please enter a message for your whisper');
      }

    }else{
      var newMsg = new Chat({msg: msg, nick: socket.nickname});
      newMsg.save(function(err){
          if(err) throw err;
          io.sockets.emit('new message', {msg: msg, nick: socket.nickname});

      });
    }
  });

  socket.on('disconnect', function(data){
    if(!socket.nickname) return;
    delete users[socket.nickname];
    updateNicknames();
  })
=======
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

>>>>>>> 7ee985f5891c57a25e4af7525a7f1e6a1655959b
});
