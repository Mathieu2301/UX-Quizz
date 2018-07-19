var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;
var path = require("path");
var fs = require("fs");

app.use(require('express').static("./web"));

io.on('connection', function(client){
    console.log("Connect : " + client)
    

    fs.readdir('../', function (err, files) {
        if (err) {
            throw err;
        }
 
        files.forEach(function (file) {

            var file_extention = path.extname(file);
            if (file_extention == ".json"){
                console.log(file);
                var file_json = require(file);
                var db_id = file_json.infos.id;
                var db_name = file_json.infos.name;
                var db_desc = file_json.infos.description;

                client.emit('db_list_add', {db_id, db_name, db_desc});
            }            
        });
    });
    
    client.on('newDB', function(data){
        var db = require("./db");
        db.newDB(Date.now(), data.name)
    })

    client.on('user_connect', function (password) {
        
    })

  
    client.on('disconnect', function(){
      console.log("Disconnect : " + client)
    });
  });

server.listen(port);