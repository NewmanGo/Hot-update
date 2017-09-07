var http = require('http');
var express = require('express');
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
var path = require('path');
var root = path.join(__dirname, 'public');//根目录
var url = require('url');
var fs = require('fs');

app.use(function(req, res, next) {
    var file = req.url;//可理解为请求的文件路径（减去根路径）
    var mode = 'reload';
    createWatcher(file, mode);
    next();
})

app.use(express.static(root));

var watchers = {};

function createWatcher(file, event) {//文件观察函数

    var absolute = path.join(root, file);
    if (watchers[absolute]) {
      return;
    }else{
      fs.watchFile(absolute, function(curr, prev){//fs模块观察文件

        if(curr.mtime !== prev.mtime){
          io.sockets.emit(event, file)//向客户端发射事件event，file为一起发送的数据
        }
      })
      watchers[absolute] = true; //将录入观察的文件放入watchers对象，并且对应值为true
    }

}
//  原理可理解为，使用fs的watchFile方法对所有的请求文件进行监听，如果发生了更改，那么就触发event事件，并发送file数据，之后客户端对事件进行接收处理。
//如果是要进行文件的热更新，那么客户端的处理就是location.reload().其实可以完全理解成，服务端主动向客户端发送了信息，客户端收到后再进行处理。
server.listen(5000, function() {
    console.log('server is starting on port 5000.')
})
