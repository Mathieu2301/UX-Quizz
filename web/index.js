$(function () {
    
    var $window = $(window);

    var socket = io();

    var blocks = {
        all: ".demo-graphs",
        start_quizz: "block1"
    }

    var language = "fr";

    socket.emit('get_language', {lang: language, function(json_lang){
        $(document).attr("title", json_lang.NAME);
        $('.mdl-layout-title').text(json_lang.NAME);

        $('meta[name=description]').attr("content", json_lang.head_description);

        $('#ux_quizz_btn').text(json_lang.nav_home);
        $('#my_results_btn').text(json_lang.nav_results);

        $('#screen_name_txtbox_label').text(json_lang.txtbox_ScreenName_label);
        $('#screen_name_txtbox_btn').text(json_lang.txtbox_ScreenName_btn);

        $('#description_txtlabel').text(json_lang.inblock_description);
    }})

    function show_block(name){
        $(name).animate({
            left: '-=50px',
            opacity: '1'
        }, 700);
    }

    function hide_block(name){
        $(name).animate({
            left: '+=50px',
            opacity: '0'
        }, 700);
    }

    document.onkeypress=function(e){
        e=e||window.event;
        var key=e.which?e.which:event.keyCode;
        notif("Key = " + key);
        console.log("Key = " + key);
    }

    $("#block1").submit(function(event) {
        var scr_name = $('#screen_name_txtbox').text();
        alert("Creating a quizz for the screen : " + scr_name);
        socket.emit('start_quizz', {user_name: getCookie('name'), screen_name: scr_name})
        event.preventDefault();
    });

    socket.on('connect', function () {
        show_block(blocks.all);
    });

    socket.on("disconnect", function(){
        hide_block(blocks.all);
    });

    socket.on('user-connected', function(id){
        notif("Un utilisateur s'est connecté", "info");
    });

    socket.on('user-disconnected', function(id){
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

    function notif(msg, type){
        var toast_msg = "";
        var toast_title = "";
        var toast_color = "blue";
        var toast_image = "";
        var toast_delay;

        toast_msg = msg;
        toast_delay = 5000;
        if (type == "error"){
            toast_title = "Erreur";
            toast_color = "red";
            toast_image = "iziToast-icon ico-error revealIn";
        }else if (type == "warn"){
            toast_title = "Attention";
            toast_color = "yellow";
            toast_image = "iziToast-icon ico-warning revealIn";
        }else if (type == "success"){
            toast_color = "green";
            toast_image = "iziToast-icon ico-success revealIn";
        }else if (type == "menuinfos"){
            toast_title = "Raccourcis clavier :";
            toast_color = "yellow";
            toast_delay = 10000;
        }else{
            toast_title = "Information";
            toast_color = "blue";
            toast_image = "iziToast-icon ico-info revealIn";
        }

        iziToast.show({
            id: null, 
            class: '',
            title: toast_title,
            titleColor: '',
            titleSize: '',
            titleLineHeight: '',
            message: toast_msg,
            messageColor: '',
            messageSize: '',
            messageLineHeight: '',
            backgroundColor: '',
            theme: 'light', // dark
            color: toast_color, // blue, red, green, yellow
            icon: toast_image,
            iconText: '',
            iconColor: '',
            image: '',
            imageWidth: 50,
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
            transitionOut: 'fadeOut',
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
        var d = new Date();
        d.setTime(d.getTime() + (365*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = name + "=" + value + ";365;path=/";
    }

});