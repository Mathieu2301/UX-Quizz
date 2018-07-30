var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;

var path = require("path");
var fs = require("fs");
var online_users = 0;

fs.readdir('./data/results/', (err, users) => {
    console.log("users :")
    users.forEach(user => {
        fs.readdir('./data/results/'+user+'/', (err, results) => {
            console.log("  "+user + "@murex.com {");
            results.forEach(result => {
                console.log("  "+"  "+result+",");
            });
            console.log('  }')
        });
    });
});

app.use(require('express').static("web"));

io.on('connection', function(client){
    online_users++
    var log__user = client.id.substr(-4);
    io.sockets.emit('users', online_users);
    setTimeout(function(){
        client_log(log__user + " joined")
    }, 200)
    
    function includes_array(str, array){
        var result = false;
        array.forEach(el => {
            if (str.includes(el)) result = true;
        });
        return result;
    }

    client.on('login', function(user, lang){
        if (user != "" && !user.includes(" ") && !user.includes("@") && !includes_array(user, ['\\', '/', ':', ';', ',', '*', '?', '!', '"', '<', '>', '|', '_', "'", '%', '#', '+', '-']) && user.includes(".")){

            log__user = user;
            io.sockets.emit('users', online_users);

            if (!fs.existsSync("./data/results/"+user+"/")){
                fs.mkdirSync("./data/results/"+user+"/")
                client_log("Le compte " + user + " vient d'être crée");
            }
            
            client.on('get_quizz', function(screen_name){
                if (screen_name != "" && !screen_name.includes(" ") && !includes_array(screen_name, ['\\', '/', ';', ',', '?', '!', '"', '<', '>', "'"])){
                    client_log(log__user + " vient de commencer un quizz : " + screen_name)

                    var step = 0;
                    var quizz_score = [];
                    var start_date = Date.now();
                    var topics = [];
            
                    var questions_json = require("./data/"+lang+"/questions.json").questions;
                    var topics_json = require("./data/"+lang+"/topics.json").heuristiques;
            
                    topics_json.forEach(topic => { topics.push(topic.label); })
                        
                    function getQuizzTopic(topic_id){
            
                        client.emit('del_questions');
                
                        var topic_actuel = 0;
                
                        topics_json.forEach(topic => {
                
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
            
                        var score = 0;
                        var moy_divis = 0;
                    
                        Object.keys(questions).map(function(question_full_id) {
                            var topic_name = question_full_id.split('_', 2)[0]
                            var question_id = question_full_id.split('_', 2)[1]
                            var answer = questions[question_full_id];
                    
                            if (answer == 1){
                                score += 0;
                                moy_divis++;
                            }else if (answer == 2){
                                score += 50;
                                moy_divis++;
                            }else if (answer == 3){
                                score += 100;
                                moy_divis++;
                            }
                
                        });
                    
                        quizz_score[step-1] = Math.round(score / moy_divis);
        
                        if (step != Object.keys(topics_json).length){
                            getQuizzTopic(step);
                        }else{
                            var moyenne = 0;
                            var moy_divis_2 = 0;
            
                            quizz_score.forEach(score => {
                                if (isNaN(score)){
                                    topics.splice(moy_divis_2, 1);
                                    quizz_score.splice(moy_divis_2, 1);
                                }else{
                                    moyenne += score;
                                    moy_divis_2++;
                                } 
                            })
            
                            var json_screen_results_file = {
                                screen_name: screen_name,
                                user: user,
                                topics: topics,
                                score: quizz_score,
                                average: Math.round(moyenne / moy_divis_2),
                                start_date: start_date,
                                finish_date: Date.now(),
                                language: lang
                            }
        
                            if (fs.existsSync("./data/results/"+user+"/")){
                                    
                                fs.writeFile("./data/results/"+user+"/"+json_screen_results_file.finish_date+".json", JSON.stringify(json_screen_results_file), function(err){
                                    if (err){
                                        client.emit('notif', "An error has occurred", "error")
                                    }else{
                                        client.emit('notif', "The quiz has been saved", "success")
                                        client.emit('show_result', json_screen_results_file);
                                        client.emit('add_result_to_table', {
                                        screen_name: json_screen_results_file.screen_name,
                                            user: user,
                                            score: json_screen_results_file.average,
                                            date: json_screen_results_file.finish_date
                                        });
                                        client.emit('close_quizz')
                                    }
                                    client_log(log__user + " a terminé son quizz ("+screen_name+") avec un score moyen de " + json_screen_results_file.average)
                                });
                            }else{
                                client.emit('notif', "Please check your email ("+ user +"@murex.com) before doing that", "warn");
                            }
                        }
                    })
                }else{
                    client.emit('notif', "WRONG SCREEN NAME", "error")
                }
            })
        
            client.on('get_result', function(date,){

                var dir = './data/results/'+user+'/';
        
                fs.readdir(dir, (err, files) => {
                    if(err){ client.emit('notif', "The result does not exist", 'error'); return; }
                    files.forEach(file => {
                        var json = require(dir+file);
                        if (json.finish_date == date){
                            client.emit('show_result', json);
                            client_log(log__user + " a demandé le résultat de l'écran " + json.screen_name, false)
                        }
                    });
                })
            })

            client.on('get_results', function(){
                var dir = './data/results/'+user+'/';

                client_log(log__user + " a demandé sa liste de résultats")
        
                client.emit('delete_results_of_table');
        
                fs.readdir(dir, (err, files) => {
                    if(err){ client.emit('notif', "Please check your email ("+ user +"@murex.com) before doing that", "warn"); return; }
        
                    files.forEach(file => {
                        var a = false;
                        var json = {};
        
                        try{
                            json = require(dir+file);
                            a = true;
                        }catch(ex){
                            client.emit('notif', "You are not connected", "error")
                        }
        
                        if (a) client.emit('add_result_to_table', {user: user, screen_name: json.screen_name, score: json.average, date: json.finish_date});
                    });
                })
            })
        
            client.on('remove_result', function(date){
                if (!date.includes('/')){
                    var dir = './data/results/'+user+'/'+date+'.json';
                    var a = false;
                    try{
                        fs.unlinkSync(dir);
                        a = true;
                    }catch(ex){}
                    if (a) client.emit('notif', "The result has been deleted", "success")
                    client_log(log__user + " a supprimé un résultat : " + date)
                }
            })
        }else{
            client.emit('notif', "WRONG EMAIL", "error")
        }
    })

    client.on('get_result_', function(date, result_user){

        var dir = './data/results/'+result_user+'/';

        fs.readdir(dir, (err, files) => {
            if(err){ client.emit('notif', "The result does not exist", 'error'); return; }
            files.forEach(file => {
                var json = require(dir+file);
                if (json.finish_date == date){
                    client.emit('show_result', json);
                    client_log(log__user + " a demandé le résultat de l'écran " + json.screen_name + " de " + result_user, false)
                }
            });
        })
    })

    client.on('get_topics', function(lang){
        if(lang != "fr") lang = "en";
        
        var topics_json = require("./data/"+lang+"/topics.json").heuristiques;

        client.emit('delete_topics_of_table');
    
        topics_json.forEach(topic => {
            client.emit('add_topic_to_table', topic);
        })

        client_log(log__user + " a demandé la liste des topics")
    })

    client.on('get_topic_labels', function(lang, callback){
        if(lang != "fr") lang = "en";

        var topics_json = require("./data/"+lang+"/topics.json").heuristiques;
        var topics_labels = [];

        topics_json.forEach(topic => {
            topics_labels.push(topic.label)
        })

        callback(topics_labels);
    })

    client.on('get_texts', function(lang, callback){
        if(lang != "fr"){
            lang = "en";
            client_log(log__user + " est maintenant Anglais")
        }else{
            lang = "fr";
            client_log(log__user + " est maintenant Français")
        } 
        
        callback(require("./data/"+lang+"/texts.json").texts);
    })

    client.on('disconnect', function(){
        online_users--
        io.sockets.emit('users', online_users);
        client_log(log__user + " left")
    });

    function client_log(log, notif=true){
        io.sockets.emit('log', log, notif)
    }
});

server.listen(port);