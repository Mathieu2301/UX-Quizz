var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;

var path = require("path");
var fs = require("fs");

app.use(require('express').static("./web"));

io.on('connection', function(client){
    console.log("Connect : " + client.id.substr(-4))
    io.sockets.emit('notif', "User connected : " + client.id.substr(-4), "info");
  
    client.on('get_quizz', function(data){

        var user_name = data.user_name;
        var screen_name = data.screen_name;
        var lang = data.language;
        var step = 0;

        var questions_json = require("./data/"+lang+"/questions.json").questions;
        var topics_json = require("./data/"+lang+"/topics.json").heuristiques;

        if (user_name != "" && screen_name != ""){
            
            function getQuizzTopic(topic_id){
    
                client.emit('del_questions');
    
                var topic_actuel = 0;
    
                topics_json.forEach(topic => {
                    // topic.name;
                    // topic.label;
                    // topic.description;
                    // topic.goals[];
    
                    if (topic_actuel == topic_id){
                        var question_actuelle = 0;
                    
                        questions_json.forEach(question => {
                            if (question.topic == topic_actuel){
                                client.emit('insert_question', topic.name + "_" + question_actuelle, screen_name + " : " + topic.label, topic.description, question.txt);
                            }
                            ++question_actuelle;
                        });

                    }

                    ++topic_actuel;   
                });

                ++step;
            }

            getQuizzTopic(step);

            client.on('save_quizz', function(questions){

                var score = [];
        
                var moy_divis = 0;
        
                Object.keys(questions).map(function(question_full_id) {
                    var topic_name = question_full_id.split('_', 2)[0]
                    var question_id = question_full_id.split('_', 2)[1]
                    var answer = questions[question_full_id];
        
                    if (answer == 1){
                        score[step] += 0;
                        moy_divis++;
                    }else if (answer == 2){
                        score[step] += 50;
                        moy_divis++;
                    }else if (answer == 3){
                        score[step] += 100;
                        moy_divis++;
                    }
        
                });
        
                score[step] = Math.round(score / moy_divis);
                console.log(score[step]);

                if (step != topics_json.lenght){
                    getQuizzTopic(step);
                }else{
                    console.log()
                }
            })

        }else{
            client.emit('notif', "Wrong screen name", "warn");
        }
    })

    client.on('get_texts', function(lang, callback){
        callback(require("./data/"+lang+"/texts.json").texts);
    })

    client.on('disconnect', function(){
        console.log("Disconn : " + client.id.substr(-4))
        io.sockets.emit('notif', "User disconnected : " + client.id.substr(-4), "info");
    });
});

server.listen(port);