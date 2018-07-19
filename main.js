var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;

var path = require("path");
var fs = require("fs");

app.use(require('express').static("./web"));

io.on('connection', function(client){
    console.log("Connect : " + client)
  
    client.on('get_language', function(lang, callback){
        callback(require("./data/"+lang+"/texts.json").texts);
    })

    client.on('disconnect', function(){
        console.log("Disconnect : " + client)
    });
});

server.listen(port);