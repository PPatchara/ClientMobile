var express = require('express');
var app = express();
var http = require('http').Server(app);

var io = require('socket.io')(http);

// Connection
io.on('connection', function(socket) {
  console.log('a user connected');
  getIpAddress();
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

// Get IP Address
var getIpAddress = function(){
  io.on('connection', function(socket) {
    var clientIpAddress = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
    console.log(' new request from : '+ clientIpAddress);
  });
}

// Receive message
io.on('connection', function(socket) {
  socket.on('gesture', function(msg) {
    console.log('gesture: ' + msg);
  });
});

// Boardcasting
// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     io.emit('chat message', msg);
//   });
// });

// Routing
app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.use(express.static('public'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});
