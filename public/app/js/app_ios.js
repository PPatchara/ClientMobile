// $(() => {
    
    // Control page
    var touchPad = document.getElementById('touchPad');
    // var switchMode = document.getElementById('switchMode');
    var mc = new Hammer(touchPad);
    // var mc_switch = new Hammer(switchMode, {
    //     touchAction: "pan-y",
    // });

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
                pageName: 'acquire',
            });
        }
    });

    var slideId="#001";

    // Acquiring mode page (Switch Mode)
    // mc_switch.get('swipe').set({
    //     direction: Hammer.DIRECTION_ALL,
    //     threshold:100,
    //     velocity:2.5
    // });

    // mc_switch.on('swipeup', (ev) => {
    //     console.log("[Gesture]: " + ev.type);
    //     socket.emit('gesture ' + ev.type, ev.type);
        
    //     mainView.router.load({
    //         pageName: 'index'
    //     });
    // });

    //BookmarkList page
    var category = 'All';
    $$('.category').on('click', function (e) {
        var target = this;
        var buttons = [
            {
                text: 'All',
                onClick: () => {
                    category = 'All';
                    mainView.router.reload({
                        pageName: 'bookmarkList',
                    });
                }
            },
            {
                text: 'Competition',
                onClick: () => {
                    category = 'Competition';
                    mainView.router.load({
                        pageName: 'bookmarkList',
                    });
                }
            },
            {
                text: 'Intership/Job Application',
                onClick: () => {
                    category = 'Intership/Job Application';
                }
            },
            {
                text: 'Keynote',
                onClick: () => {
                    category = 'Keynote';
                }
            },
            {
                text: 'Scholarship',
                onClick: () => {
                    category = 'Scholarship';
                }
            },
            {
                text: 'Recreation',
                onClick: () => {
                    category = 'Recreation';
                }
            },
            {
                text: 'Workshop/Camp',
                onClick: () => {
                    category = 'Workshop/Camp';
                }
            },
            {
                text: 'Cancel',
                color: 'red'
            }
        ];
        myApp.actions(target, buttons);
    });

    // Tab bar
    $$('.disconnect').on('click', () => {
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
                    socket.emit('tabbar share', 'facebook');
                    var url = "https://www.facebook.com/sharer/sharer.php?u=http%3A//framework7.io/docs/cards.html&display=popup";
                    var newTab = window.open(url, '_blank');
                    newTab.focus();
                }
            },
            {
                text: 'Email',
                onClick: () => {
                    socket.emit('tabbar share', 'email');
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
                    socket.emit('tabbar share', 'save image');
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

    $$('.addCalendar').on('click', () => {
        socket.emit('tabbar calendar', 'addCalendar');
    })

    // Socket begin
    // Join server
    function sendJoinToServer() {
        var message = { 
            'uid': localStorage.getItem('uid')
        };
        socket.emit('join', message);
        console.log(localStorage.getItem('uid'));
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

    socket.on('currentstate', (_slideId, loopState) => {
        console.log(`currentstate <slide=${_slideId}>`);
        socket.emit('currentstate', _slideId, loopState);
        getBookmarkList(getUid());
        slideId = _slideId;
    });
    

    // Acquiring mode page
    

    $$('body').on('click', '.external-page', (e) => {
        let elem = $(e.srcElement);
        let url = elem.data('url');
        let newTab = window.open(url, '_system');
        newTab.focus();        
    });



    function renderAcquiringPage(page) {
        console.log("Navigated to acquiring mode.");
        console.log("slideId: " + slideId);
        var eventObj = _.find(event_list,{ 'id': slideId});

        var acquiringHTML = Template7.templates.acquiringTemplate(
            {
                title: _.get(eventObj, 'title'),
                category: _.get(eventObj, 'category'),
                image: _.get(eventObj, 'image'),
                description: _.get(eventObj, 'description'),
                schedule: _.get(eventObj, 'schedule'),  
                location: _.get(eventObj, 'location'),  
                register: _.get(eventObj, 'register'),
                contact: _.get(eventObj, 'contact')
            }
        );

        $$(page.container).find('.page-content').html(acquiringHTML);

        // var mySwiper = myApp.swiper('.swiper-container', {
        //     pagination:'.swiper-pagination'
        // });

    }

    myApp.onPageInit('acquire', renderAcquiringPage);
    myApp.onPageReinit('acquire', renderAcquiringPage);

    function getUid() {
        return localStorage.getItem('uid');
    }

// });