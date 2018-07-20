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
            
            var questions_json = require("./data/"+lang+"/questions.json").questions;
            var topics_json = require("./data/"+lang+"/topics.json").heuristiques;

            var topic_actuel = 0;

            topics_json.forEach(topic => {
                // topic.name;
                // topic.label;
                // topic.description;
                // topic.goals[];

                var question_actuelle = 0;
                
                questions_json.forEach(question => {
                    if (question.topic = topic_actuel){
                        client.emit('insert_question', topic.name + "_" + question_actuelle, screen_name + " : " + topic.label, topic.description, question.txt);
                    }
                    ++question_actuelle;
                });

                ++topic_actuel;
                
            });

            

        }else{
            console.log("USER = " + user_name + " // SCREEN = " + screen_name);
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