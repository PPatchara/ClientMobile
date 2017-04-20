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

    // TouchPad
    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.on('swipeleft swiperight swipedown doubletap', (ev) => {
        console.log("[Gesture]: " + ev.type);

        socket.emit('gesture ' + ev.type, ev.type);

        if (ev.type == 'swipedown') {
            mainView.router.load({
                pageName: 'acquire',
            });
        } else if (ev.type == 'doubletap') {
            addBookmarkWithRender(slideId);
        }
    });

    

    // Acquiring mode page (Switch Mode)
    mc_switch.get('swipe').set({
        direction: Hammer.DIRECTION_ALL,
        threshold:100,
        velocity:2.5
    });

    mc_switch.on('swipeup', (ev) => {
        console.log("[Gesture]: " + ev.type);
        socket.emit('gesture ' + ev.type, ev.type);
        
        mainView.router.load({
            pageName: 'index'
        });
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
    $$('.disconnect').on('click', () => {
       myApp.confirm('', 'Are you sure to disconnect?', () => {
           myApp.alert('','Disconnected');
       });
    });

    $$('.share').on('click', () => {
        let event = EventListService.get(slideId);
        console.log(slideId);
        console.log(event);
        var buttons = [
            {
                text: 'Share',
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
                text: 'Email',
                onClick: () => {
                    socket.emit('tabbar share', 'email');
                    $(location).attr('href', 'mailto:?subject='
                             + encodeURIComponent(event.share.email.subject)
                             + "&body=" 
                             + encodeURIComponent(event.share.email.body)
                    );
                }
            },
            {
                text: 'Save image',
                onClick: () => {
                    socket.emit('tabbar share', 'save image');
                    var url = `${imageAddress}/${event.image}`;
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

    $$('.addCalendar').on('click', (e) => {
        let event = EventListService.get(slideId);
        let url = event.calendar;
        window.open(`${calendarAddress}/${event.calendar}`, '_blank');
        socket.emit('tabbar calendar', 'addCalendar');
    })

    // Socket begin
    // Join server
    function sendJoinToServer() {
        var message = { 
            'uid': Cookies.get('connect.sid')
        };
        socket.emit('join', message);
        console.log(`connect.sid = ${Cookies.get('connect.sid')}`);
    }

    sendJoinToServer();

    // Control mode

    socket.on('currentstate', (_slideId, loopState) => {
        console.log(`currentstate <slide=${_slideId}>`);
        socket.emit('currentstate', _slideId, loopState);
        getBookmarkListWithRender();
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

// });