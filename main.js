var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;

var path = require("path");
var fs = require("fs");

app.use(require('express').static("./web"));

io.on('connection', function(client){
    console.log("Connect : " + client)
  
    client.on('start_quizz', function(data){

        var user_name = data.user_name;
        var screen_name = data.screen_name;
        var lang = data.language;

        if (user_name != "" && screen_name != ""){

            
            

            socket.emit('insert_question', "q2", "J'ai mangé du chocolat", function(answer){
                if (answer == 0){
                    console.log("Pas de réponse")
                }else if (answer == 1){
                    console.log("Réponse : Non")
                }else if (answer == 2){
                    console.log("Réponse : Partiellement")
                }else if (answer == 3){
                    console.log("Réponse : Oui")
                }else{
                    console.log("Vous devez répondre à toutes les questions", "error")
                }
            })

        }else{
            console.log("aa")
            client.emit('notif', "Wrong screen name", "warn");
        }
    })

    client.on('get_language', function(lang, callback){
        callback(require("./data/"+lang+"/texts.json").texts);
    })

    client.on('disconnect', function(){
        console.log("Disconnect : " + client)
    });
});

server.listen(port);