$(function () {
    
    var $window = $(window);

    var socket = io();

    $("#banner").animate({
        opacity: '1'
    }, 500);

    $("#banner_int").animate({
        top: '-=50px',
        opacity: '1'
    }, 900);

    setTimeout(function(){
        
    }, 2000);
    
    document.onkeypress=function(e){
        e=e||window.event;
        var key=e.which?e.which:event.keyCode;
        notif("Key = " + key);
        console.log("Key = " + key);
    }

    socket.on('connect', function () {
        // Connexion réussie
    });

    socket.on("disconnect", function(){
        // Connexion perdue
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

});