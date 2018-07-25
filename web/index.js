$(function () {
    
    var $window = $(window);

    var socket = io();

    var blocks = {
        all: ".demo-graphs",
        description_block: "#description_block",
        login: "#login_block",
        start_quizz: "#start_quizz",
        quizz_questions: "#quizz_questions",
        my_results: ".results_blocks",
        crit_ergo_block: ".crit_ergo_blocks"
    }

    var language = "en";
    if (getCookie('lang') != "fr" && getCookie('lang') != "en"){
        setCookie('lang', 'en');
    }
    setLanguage(getCookie('lang'));

    function setLanguage(lang){
        if (lang == "en"){
            setCookie('lang', 'en');
            language = "en";

            $('#setEN_btn').fadeOut();
            $('#setFR_btn').fadeIn();
        }else{
            setCookie('lang', 'fr');
            language = "fr";

            $('#setEN_btn').fadeIn();
            $('#setFR_btn').fadeOut();
        }

        socket.emit('get_texts', language, function(json_lang){
            $(document).attr("title", json_lang.main.NAME);
            $('.mdl-layout-title').text(json_lang.main.NAME);
    
            $('#ux_quizz_label').text(json_lang.labels.nav_home);
            $('#my_results_label').text(json_lang.labels.nav_results);
            $('#crit_ergo_label').text(json_lang.labels.nav_crit_ergo);
    
            $('#login_block_title').text(json_lang.titles.login_block);
            $('#username_txtbox_label').text(json_lang.txtboxs.login_placeholder);
            $('#username_txtbox_btn').val(json_lang.buttons.next);

            $('#start_quizz_block_title').text(json_lang.titles.start_quizz_block);
            $('#screen_name_txtbox_label').text(json_lang.txtboxs.screenname_placeholder);
            $('#screen_name_txtbox_btn').val(json_lang.buttons.start);
    
            $('#description_block_title').text(json_lang.titles.description_block + " " + getCookie('user'));
            $('#description').html(json_lang.other.description_block);
        
            $('#questions_validate_btn').text(json_lang.buttons.next);
            $('#questions_cancel_btn').text(json_lang.buttons.cancel);

            $('#my_result_block_title').text(json_lang.labels.nav_results);
            $('#my_result_block_error').text(json_lang.other.no_results_error);
            $('#my_result_table_screen_name').text(json_lang.txtboxs.screenname_placeholder);
            $('#my_result_table_score').text(json_lang.other.score);
            $('#my_result_table_date').text(json_lang.other.date);
        })
    }
    
    $('#setEN_btn').on('click', function(){ setLanguage("en"); });
    $('#setFR_btn').on('click', function(){ setLanguage("fr"); });

    socket.on('show_block', function(name){show_block(name);});
    function show_block(name){
        if ($(name).css('opacity') == 0){        
            $(name).animate({
                left: '0px',
                opacity: '1',
                height: '50%',
                padding: "16px 32px",
                margin: "8px"
            }, 300);

            if ($("#loading").is(":visible")){$('#loading').fadeOut(200);}
        } 
    }

    socket.on('hide_block', function(name){hide_block(name);});
    function hide_block(name, loader=true){
        if ($(name).css('opacity') == 1){
            $(name).animate({
                left: '-1000px',
                opacity: '0',
                height: '0px',
                padding: '0px',
                margin: '0px'
            }, 300);

            if ($("#loading").is(":hidden") && loader){$('#loading').fadeIn(200);}
        }
    }

    $('#ux_quizz_btn').on("click", function(){
        
        hide_block(blocks.my_results)
        hide_block(blocks.crit_ergo_block, false);
        
        if (getCookie("user") != ""){
            hide_block(blocks.description_block, false)
            if (Object.keys(questions).length <= 1){
                show_block(blocks.start_quizz);
            }else{
                show_block(blocks.quizz_questions);
            }
        }else{
            show_block(blocks.description_block);
            show_block(blocks.login);
        }
    })

    $('#my_results_btn').on("click", function(){

        hide_block(blocks.quizz_questions);
        hide_block(blocks.start_quizz, false)
        hide_block(blocks.description_block, false)
        hide_block(blocks.crit_ergo_block, false);

        if (getCookie("user") == ""){
            show_block(blocks.login);
        }else{
            hide_block(blocks.login, false);
        }
        show_block(blocks.my_results)

        socket.emit('get_results', getCookie('user'))
        
        updateTableVisible()
    })

    $('#crit_ergo_btn').on('click', function(){
        hide_block(blocks.description_block);
        hide_block(blocks.login, false);
        hide_block(blocks.my_results, false);
        hide_block(blocks.quizz_questions, false);
        hide_block(blocks.start_quizz, false);

        socket.emit('get_topics', getCookie('lang'))
        socket.emit('get_topic_labels', getCookie('lang'), function(topics){
            setRadar(topics, [], "Radar");
        })

        show_block(blocks.crit_ergo_block);
    })

    document.onkeypress=function(e){
        e=e||window.event;
        var key=e.which?e.which:event.keyCode;
        console.log("Key = " + key);
    }

    $("#start_quizz").submit(function(event) {
        var scr_name = $('#screen_name_txtbox').val();

        socket.emit('get_quizz', {user_name: getCookie('user'), screen_name: scr_name, language: language})
        event.preventDefault();
    });
    
    $("#login_block").submit(function(event) {
        var user_name = $('#username_txtbox').val();
        if (user_name.includes("@")){
            notif('Please do not enter the "@murex.com"', "warn");
        }else{
            setCookie('user', user_name);

            hide_block(blocks.login);
            show_block(blocks.start_quizz);
        }

        event.preventDefault();
    });

    socket.on('connect', function () {

        setTimeout(function(){

            if (getCookie("user").includes('@')){
                notif('Please do not enter the "@murex.com"', "warn");
                setCookie('user', "");
            }

            if (getCookie("user") != ""){
                show_block(blocks.description_block);
                show_block(blocks.start_quizz);
            }else{
                show_block(blocks.description_block);
                show_block(blocks.login);
            }
        }, 200)
        

    });

    socket.on('del_questions', function(){
        $('.question').remove();
        questions = {};
    })

    var questions = {};

    socket.on('insert_question', function(id, title, tag_description, tag_text){
        hide_block(blocks.start_quizz);
        show_block(blocks.quizz_questions);

        $('#quizz_block_title').text(title);
        $('#quizz_block_description').text(tag_description);

        var template = '<li class="mdl-list__item question"><span class="mdl-list__item-primary-content" style="width: 50%;"><i class="material-icons" style="padding-right: 15px;bottom: 1px;position: relative;">add_circle</i><div id="question_text" style="width: 70%;">{text}​</div></span><span class="mdl-list__item-secondary-action"><label class="radio-container" for="{id}o1">Non<input type="radio" id="{id}o1" name="{id}" value="1" checked><span class="checkmark"></span></label><label class="radio-container" for="{id}o2">Partiellement<input type="radio" id="{id}o2" name="{id}" value="2"><span class="checkmark"></span></label><label class="radio-container" for="{id}o3">Oui<input type="radio" id="{id}o3" name="{id}" value="3"><span class="checkmark"></span></label><label class="radio-container" for="{id}o4">Non applicable<input type="radio" id="{id}o4" name="{id}" value="0"><span class="checkmark"></span></label></span></li>';
        
        var html = template.replace(/{id}/g, id).replace(/{text}/g, tag_text);
        $("#list-questions").append(html);

        questions[id] = "_";

        //console.log('ID = ' + id + " | TITLE = " + title + " | TAG_DESCRIPTION = " + tag_description + " | TAG_TEXT = " + tag_text);
    })

    $('#questions_cancel_btn').on("click", function(){
        show_block(blocks.start_quizz);
        hide_block(blocks.quizz_questions, false)
        $('.question').remove();
        questions = {};
    })

    $('#questions_validate_btn').on("click", function(){
        var return_ = false;

        $.each(questions, function(question_id, answer){

            questions[question_id] = $('input[name='+question_id+']:checked').val();

            if (questions[question_id] == undefined){
                notif("Please answer to all questions.", "warn")
                return_ = true;
                return false;
            }
        });

        if (!return_){
            socket.emit('save_quizz', questions);
            
            $('.question').remove();
            questions = {};
            hide_block(blocks.quizz_questions, false)
        }
    })
    
    socket.on('show_result', function(data){
        show_block(blocks.my_results)
        setRadar(data.topics, data.score, data.screen_name);
    })

    function setRadar(radar_labels, radar_data, radar_title){
        var ctx = document.getElementById("result-chart").getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: radar_labels,
                datasets: [{
                    label: "",
                    data: radar_data,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(255,99,132,1)'],
                    borderWidth: 3
                },
                {
                    label: "",
                    data: [100, 0]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                }
            }
        });

        $('#result_block_title').text(radar_title)
    }
    
    socket.on('delete_results_of_table', function(){
        $('.result_item').remove();
        updateTableVisible()
    })

    socket.on('add_result_to_table', function(data){

        var date = new Date(data.date)

        let month = String(date.getMonth() + 1);
        let day = String(date.getDate());
          
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
          
        var formatted_date = `${day}/${month}`;

        $('#list_results').prepend('<tr class="result_item" id="'+ data.date +'"><td class="mdl-data-table__cell--non-numeric">'+ data.screen_name +'</td><td class="mdl-data-table__cell--non-numeric">'+ data.score +'%</td><td class="mdl-data-table__cell--non-numeric">'+ formatted_date +'</td><td><button href="javascript:void(0)" id="del_'+ data.date +'" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon"><i class="material-icons mdl-color-text--grey-600">delete</i></button></td></tr>');
        
        $('#'+ data.date).on('click', function(){
            select();
        })

        $('#del_'+ data.date).on('click', function(){
            iziToast.question({
                timeout: false,
                close: false,
                overlay: true,
                displayMode: 'once',
                closeOnEscape: true,
                overlayClose: true,
                maxWidth: 550,
                id: 'question',
                zindex: 999,
                title: 'Hey',
                message: 'Are you sure you want to delete the result ?',
                position: 'center',
                transitionOut: "fadeOutDown",
                buttons: [
                    ['<button><b>YES</b></button>', function (instance, toast) {
             
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

                        socket.emit('remove_result', getCookie('user'), data.date);
                        socket.emit('get_results', getCookie('user'));
                    }, true],
                    ['<button>NO</button>', function (instance, toast) {
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                    }],
                ]
            });
        })

        function select(){
            $('.result_item').css('background-color', '')
            socket.emit('get_result', getCookie('user'), data.date);
            $('#'+ data.date).css('background-color', 'lightgrey')
        }

        select();
        updateTableVisible();
    })

    var topics = [];
    socket.on('delete_topics_of_table', function(){
        $('.topic_item').remove();
        $('.topic_goal').remove();
        topics = [];
    })
    
    socket.on('add_topic_to_table', function(topic){
        // topic.name
        // topic.label
        // topic.description
        // topic.goals[]

        $('#list_topics').prepend('<tr class="topic_item" id="'+ topic.name +'"><td class="mdl-data-table__cell--non-numeric">'+ topic.label +'</td></tr>');
        topics.push(topic.label)

        $('#'+ topic.name).on('click', function(){
            select();
        })

        function select(){
            $('.topic_item').css('background-color', '')
            
            $('#topics_2_block_title').text(topic.label)
            $('#topics_2_block_description').text(topic.description)
            $('.topic_goal').remove();
            topic.goals.forEach(goal => {
                $('#topics_2_block_goal_list').prepend('<span class="mdl-chip topic_goal"><span class="mdl-chip__text">' + goal +'</span></span>')
            });

            $('#'+ topic.name).css('background-color', 'lightgrey')
        }

        select();
    })

    

    function updateTableVisible(){

        if($(".result_item").length == 0){
            $('#results_table').hide();
        }else{
            $('#my_result_block_error').hide();
            $('#results_table').show();
        }
    }

    socket.on("disconnect", function(){
        hide_block(blocks.all);
    });

    socket.on('user-connected', function(){
        notif("Un utilisateur s'est connecté", "info");
    });

    socket.on('user-disconnected', function(){
        notif("Un utilisateur s'est déconnecté", "info");
    });

    function fullscreen(){
        var docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        }
        else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
    }

    socket.on('users_online', function(nb){
        $('#online_users_label').text('En ligne : ' + nb)
    })

    socket.on('notif', function(text, type){ notif(text, type); })

    function notif(msg, type){
        var toast_msg = "";
        var toast_title = "";
        var toast_color = "blue";
        var toast_image = "";
        var toast_delay;

        toast_msg = msg;
        toast_delay = 5000;
        if (type == "error"){
            toast_title = "Error";
            toast_color = "red";
            toast_image = "iziToast-icon ico-error revealIn";
        }else if (type == "warn"){
            toast_title = "Error";
            toast_color = "yellow";
            toast_image = "iziToast-icon ico-warning revealIn";
        }else if (type == "success"){
            toast_color = "green";
            toast_image = "iziToast-icon ico-success revealIn";
        }else{
            toast_title = "Info";
            toast_color = "blue";
            toast_image = "iziToast-icon ico-info revealIn";
        }

        iziToast.show({
            id: null, 
            title: toast_title,
            message: toast_msg,
            messageSize: '',
            messageLineHeight: '',
            theme: 'light', // dark
            color: toast_color, // blue, red, green, yellow
            icon: toast_image,
            maxWidth: null,
            zindex: null,
            layout: 2,
            balloon: false,
            close: true,
            closeOnEscape: true,
            closeOnClick: true,
            rtl: false,
            position: 'bottomRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
            target: '',
            targetFirst: true,
            toastOnce: false,
            timeout: toast_delay,
            animateInside: true,
            drag: true,
            pauseOnHover: true,
            resetOnHover: false,
            progressBar: true,
            overlay: false,
            overlayClose: false,
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            transitionIn: 'fadeInUp',
            transitionOut: 'fadeOutDown',
            transitionInMobile: 'fadeInUp',
            transitionOutMobile: 'fadeOutDown'
        });
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function setCookie(name, value) {
        document.cookie = name + "=" + value + ";365;path=/";
    }

});