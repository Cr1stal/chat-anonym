var httpd = require('http').createServer(handler);
var io = require('socket.io').listen(httpd);
var fs = require('fs');
var room_number = 1;
var port = process.env.PORT | 4000;
httpd.listen(port);

function handler(req, res) {
  fs.readFile(__dirname + '/index.html',
      function(err,data) {
	if(err){
	  res.writeHead(500);
	  return res.end('Error loading index.html');
	}

	res.writeHead(200);
	res.end(data);
      });
}
      
io.sockets.on('connection', function(socket) {
  socket.on('clientMessage', function(content) {
    socket.emit('serverMessage', 'Я сказал: ' + content);
    var room = io.sockets.manager.roomClients[socket.id];
    var r_number = null;
    for (x in room)
    {
      if(x != '') {
	r_number = x;
      }
    }
    socket.broadcast.to(r_number.substring(1)).emit('serverMessage', "Аноним сказал: " + content);
  });
  socket.on('login', function(){
    socket.join('waiting');
    client_size = io.sockets.clients('waiting');
    if(client_size.length % 2 == 0) {
      for(var i=0; i<client_size.length; i++) {
	client_size[i].leave('waiting');
	client_size[i]['room'] = room_number.toString();
	client_size[i].join(room_number.toString());
	client_size[i].emit('serverMessage', 'Аноним присоединился к чату');
      }
      room_number += 1;
    }
  });

  socket.on('disconnect', function() {
    var room = io.sockets.manager.roomClients[socket.id];
    var r_number = null;
    for (x in room)
    {
      if(x != '') {
        r_number = x;
      }
    }
    socket.broadcast.to(r_number.substring(1)).emit('serverMessage', "Аноним вышел.");
  });
});
