// $(() => {
    
    // Control page
    var slideId="#001";
    var touchPad = document.getElementById('touchPad');
    var switchMode = document.getElementById('switchMode');
    var mc = new Hammer(touchPad);
    var mc_switch = new Hammer(switchMode, {
        touchAction: "pan-y",
    });

    // Socket
    var socket = io();
    var connected = false;
    var isPlayed = false;

    // Socket begin
    // Join server
    function sendJoinToServer() {
        var message = { 
            'uid': Cookies.get('connect.sid')
        };
        socket.emit('join', message);
    }

    socket.on('joined', (message) => {
        isPlayed = false;
        console.log('[isPlayed]: ' + isPlayed);
        if (message.isNewUser) {
            // $$('.login-screen').addClass('modal-in');
            myApp.popup('.popup.popup-tutorial');
        }
    });
    sendJoinToServer();

    // Control mode
    socket.on('currentstate', (_slideId, loopState) => {
        slideId = _slideId;
        console.log(`currentstate <slide=${_slideId}>`);
        socket.emit('currentstate', _slideId, loopState);
        getBookmarkListWithRender();
    });


    // TouchPad
    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.on('swipeleft swiperight swipeup tap press', (ev) => {
        console.log("[Gesture]: " + ev.type);

        socket.emit('gesture ' + ev.type, ev.type);

        if (ev.type == 'swipeup') {
            // mainView.router.load({
            //     pageName: 'acquire',
            // });
            myApp.popup('.popup.popup-details');

        } else if (ev.type == 'press') {
            addBookmarkWithRender(slideId);
        } else if (ev.type == 'tap') {
            togglePlayPause();
        }
    });

    socket.on('toggle played', () => {
        isPlayed = true;
        console.log("Played");
    });
    socket.on('toggle paused', () => {
        isPlayed = false;
        console.log("Paused");
    });

    function togglePlayPause() {
        if (isPlayed) {
            socket.emit('toggle pause', 'pause');
        } else {
            socket.emit('toggle play', 'play');
        }
    }

    // Acquiring mode page (Switch Mode)
    mc_switch.get('swipe').set({
        direction: Hammer.DIRECTION_ALL,
        // threshold:100,
        // velocity:2.5
    });

    mc_switch.on('swipedown', (ev) => {
        console.log("[Gesture]: " + ev.type);
        socket.emit('gesture ' + ev.type, ev.type);
        
        mainView.router.load({
            pageName: 'index'
        });
        myApp.closeModal('.popup.popup-details');
    });

    //BookmarkList page
    // var category = 'All';
    // $$('.category').on('click', function (e) {
    //     var target = this;
    //     var buttons = [
    //         {
    //             text: 'All'
    //         },
    //         {
    //             text: 'Competition'
    //         },
    //         {
    //             text: 'Intership/Job Application',
    //             onClick: () => {
    //                 category = 'Intership/Job Application';
    //             }
    //         },
    //         {
    //             text: 'Keynote',
    //             onClick: () => {
    //                 category = 'Keynote';
    //             }
    //         },
    //         {
    //             text: 'Scholarship',
    //             onClick: () => {
    //                 category = 'Scholarship';
    //             }
    //         },
    //         {
    //             text: 'Recreation',
    //             onClick: () => {
    //                 category = 'Recreation';
    //             }
    //         },
    //         {
    //             text: 'Workshop/Camp',
    //             onClick: () => {
    //                 category = 'Workshop/Camp';
    //             }
    //         },
    //         {
    //             text: 'Cancel',
    //             color: 'red'
    //         }
    //     ];
    //     myApp.actions(target, buttons);
    // });

    // Tab bar
    $$('#disconnect').on('click', () => {
       // myApp.confirm('', 'Are you sure to disconnect?', () => {
       //     myApp.alert('','Disconnected');
       // });
       myApp.confirm('Are you sure to disconnect?' , 'Disconnect', 
            function () {
                myApp.alert('Please scan QR code to control the display.', function () {
                    window.location.replace("/");
                });
            },
            function () {
                window.location.reload();
            }
       );
       // window.location = "10.50.8.13:3000";
       socket.emit('tabbar disconnect', 'disconnect');
    });

    $$('#share').on('click', () => {
        let event = EventListService.get(slideId);
        console.log(slideId);
        console.log(event);
        var buttonShare = [
            {
                text: 'Share',
                label: true
            },
            {
                text: 'Email',
                onClick: () => {
                    socket.emit('tabbar share', 'email');
                    sendEmail(event.share.email.subject, event.share.email.body);
                }
            }
            // {
            //     text: 'Save image',
            //     onClick: () => {
            //         socket.emit('tabbar share', 'save image');
            //         var url = `${imageAddress}/${event.image}`;
            //         var newTab = window.open(url, '_blank');
            //         newTab.focus();
            //     }
            // }
        ];
        var buttonSocialShare = [
            {
                text: 'Social Share',
                label: true
            },
            {
                text: 'Facebook',
                onClick: () => {
                    socket.emit('tabbar share', 'facebook');
                    let url = event.share.facebook;
                    var newTab = window.open(url, '_blank');
                    newTab.focus();
                }
            },
            {
                text: 'Google+',
                onClick: () => {
                    socket.emit('tabbar share', 'google+');
                    let url = event.share.googleplus;
                    var newTab = window.open(url, '_blank');
                    newTab.focus();
                }
            },
            {
                text: 'Twitter',
                onClick: () => {
                    socket.emit('tabbar share', 'twitter');
                    let url = event.share.twitter;
                    var newTab = window.open(url, '_blank');
                    newTab.focus();
                }
            }
        ];
        var buttonsCancel = [
            {
                text: 'Cancel',
                color: 'red'
            }
        ];

        var buttonGroups = [buttonShare, buttonSocialShare, buttonsCancel];
        myApp.actions(buttonGroups);
    });

    // $$('#addCalendar').on('click', (e) => {
    //     let event = EventListService.get(slideId);
    //     let url = event.calendar;
    //     window.open(`${calendarAddress}/${event.calendar}`, '_blank');
    //     socket.emit('tabbar calendar', 'addCalendar');
    // })

    $$('#help').on('click', (e) => {
        // mainView.router.load({
        //     pageName: 'help',
        // });
        myApp.popup('.popup.popup-tutorial');
        socket.emit('tabbar help', 'help');
    });

    // Acquiring mode page

    $$('body').on('click', '.external-page', (e) => {
        let elem = $(e.srcElement);
        let url = elem.data('url');
        console.log("External URL" + url);
        let newTab = window.open(url, '_blank');
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
                contact: _.get(eventObj, 'contact'),
                share: _.get(eventObj, 'share')
            }
        );

        $$(page.container).find('.page-content').html(acquiringHTML);


        // var mySwiper = myApp.swiper('.swiper-container', {
        //     pagination:'.swiper-pagination'
        // });

    }

    myApp.onPageInit('acquire', renderAcquiringPage);
    myApp.onPageReinit('acquire', renderAcquiringPage);

    // function renderAcquisitionPage(slideId) {
    //     console.log("Navigated to acquiring mode.");
    //     console.log("slideId: " + slideId);
    //     var eventObj = _.find(event_list,{ 'id': slideId});

    //     var acquiringHTML = Template7.templates.acquiringTemplate(
    //         {
    //             title: _.get(eventObj, 'title'),
    //             category: _.get(eventObj, 'category'),
    //             image: _.get(eventObj, 'image'),
    //             description: _.get(eventObj, 'description'),
    //             schedule: _.get(eventObj, 'schedule'),  
    //             location: _.get(eventObj, 'location'),  
    //             register: _.get(eventObj, 'register'),
    //             contact: _.get(eventObj, 'contact'),
    //             share: _.get(eventObj, 'share')
    //         }
    //     );
    //     $$(page.container).find('.page-content').html(acquiringHTML);
    // }

// });