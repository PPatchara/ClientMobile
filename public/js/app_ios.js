// $(() => {
    var option = {
        swipeBackPage:false,
    };
    var myApp = new Framework7({
        precompileTemplates: true,
        fastClicks:false,
        modalCloseByOutside: true,
        actionsCloseByOutside: true,
        modalActionsCloseByOutside: true
    });

    var $$ = Dom7;

    var mainView = myApp.addView('.view-main', {
        dynamicNavbar: true,
        domCache: true
    });

    // Control page
    var touchPad = document.getElementById('touchPad');
    var switchMode = document.getElementById('switchMode');
    var mc = new Hammer(touchPad);
    var mc_switch = new Hammer(switchMode, {
        touchAction: "pan-y",
    });

    // Socket
    var socket = io();
    var connected = false;

    // TouchPad
    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.on('swipeleft swiperight swipeup swipedown doubletap', (ev) => {
        console.log("[Gesture]: " + ev.type);
        socket.emit('gesture ' + ev.type, ev.type);
        if (ev.type == 'swipedown') {
            mainView.router.load({
                pageName: 'details',
            });
        }
    });

    // Details page (Switch Mode)
    mc_switch.get('swipe').set({
        direction: Hammer.DIRECTION_ALL,
        threshold:100,
        velocity:2
    });

    mc_switch.on('swipeup', (ev) => {
        console.log("[Gesture]: " + ev.type);
        socket.emit('gesture ' + ev.type, ev.type);
        
        mainView.router.load({
            pageName: 'index'
        });
    });

    //Saved page
    $$('.category').on('click', function (e) {
        var target = this;
        var buttons = [
            {
                text: 'All'
            },
            {
                text: 'Competition'
            },
            {
                text: 'Intership/Job Application'
            },
            {
                text: 'Keynote Lectures'
            },
            {
                text: 'Scholarship'
            },
            {
                text: 'Recreation'
            },
            {
                text: 'Workshop/Camp'
            },
            {
                text: 'Cancel',
                color: 'red'
            }
        ];
        myApp.actions(target, buttons);
    });

    $('.bookmark-card').on('click', (e) => {
        let target = $(e.target).parent();
        $(target).toggleClass('active');
        socket.emit('bookmark-card', 'test'); 
    });

    // Tab bar
    $$('.confirm-disconnect').on('click', () => {
       myApp.confirm('', 'Are you sure to disconnect?', () => {
           myApp.alert('','Disconnected');
       });
    });

    $$('.share').on('click', () => {
        var buttons = [
            {
                text: 'Share',
                label: true
            },
            {
                text: 'Facebook',
                onClick: () => {
                    socket.emit('share', 'facebook');
                    var url = "https://www.facebook.com/sharer/sharer.php?u=http%3A//framework7.io/docs/cards.html&display=popup";
                    var newTab = window.open(url, '_blank');
                    newTab.focus();
                }
            },
            {
                text: 'Email',
                onClick: () => {
                    socket.emit('share', 'email');
                    $(location).attr('href', 'mailto:?subject='
                             + encodeURIComponent("This is my subject")
                             + "&body=" 
                             + encodeURIComponent("This is my body")
                    );
                }
            },
            {
                text: 'Save image',
                onClick: () => {
                    socket.emit('share', 'save image');
                    var url = "https://i.ytimg.com/vi/tntOCGkgt98/maxresdefault.jpg";
                    var newTab = window.open(url, '_blank');
                    newTab.focus();
                }
            },
            {
                text: 'Cancel',
                color: 'red'
            },
        ];
        myApp.actions(buttons);
    });

    // Socket begin
    // Join server
    function sendJoinToServer() {
        var message = { 
            'uid': localStorage.getItem('uid')
        };
        socket.emit('join', message);
    }

    socket.on('joined', (data) => {
        connected = true;

        if (data.status === 'new user') {
            console.log('[New user] ' + data.uid);
            localStorage.setItem('uid', data.uid);

        }
    });

    sendJoinToServer();

    // Control mode
    socket.on('currentstate', (currentId, loopState) => {
        console.log('CurrentId: ' + currentId + ", " + loopState);
        socket.emit('currentstate', currentId, loopState);
    });
    socket.on('bookmarked', (data) => {
        $$('#bookmark').addClass('active');
        console.log('bookmarked');
    });
    socket.on('unbookmarked', (data) => {
        $$('#bookmark').removeClass('active');
        console.log('unbookmarked');
    });

    $$('#bookmark').on('click', () => {
        if($$('#bookmark').hasClass('active')) {
            $$('#bookmark').toggleClass('active');
            console.log('[click]unbookmarked');
            socket.emit('bookmark', false);
        }else {
            $$('#bookmark').toggleClass('active');
            console.log('[click]bookmarked');
            socket.emit('bookmark', true);
        }
        
    });

    // Details page
    $$('body').on('click', '.external-page', (e) => {
        let elem = $(e.srcElement);
        let url = elem.data('url');
        let newTab = window.open(url, '_system');
        newTab.focus();        
    });

    function initDetailsPage(page) {
        console.log("Navigated to details page.");
        var detailsHTML = Template7.templates.detailsTemplate({
            title: "Test1 Title",
            category: "Competition",
            description: 
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
            schedule: [
                {
                    topic: "Register",
                    date: "12/02/2017"
                },
                {
                    topic: "Presentation",
                    date: "30/04/2017"
                } 
            ],  
            location: "ABC Building",
            contact: [
                {
                    website: "http://www.google.com",
                    email: "test@test.com",
                    tel: "089-7046621"
                }
            ]
        });

        $$(page.container).find('.page-content').html(detailsHTML);

        // var mySwiper = myApp.swiper('.swiper-container', {
        //     pagination:'.swiper-pagination'
        // });

    }

    function renderSaveList(page) {
        console.log("Navigated to save list");
        var saveListHTML = Template7.templates.saveListTemplate({
            title: "Test1 Title",
            category: "Competition",
            schedule: [
                {
                    topic: "Register",
                    date: "12/02/2017"
                },
                {
                    topic: "Presentation",
                    date: "30/04/2017"
                } 
            ],  
            location: "ABC Building"
        });

        $$(page.container).find('.page-content').html(saveListHTML);
    }

    myApp.onPageInit('details', initDetailsPage);
    myApp.onPageReinit('details', initDetailsPage);

    myApp.onPageInit('saved', renderSaveList);
    myApp.onPageReinit('saved', renderSaveList);

// });