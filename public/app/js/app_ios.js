// $(() => {
    var serverAddress = 'http://10.50.8.13:3000/api';
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
    var category = 'All';
    $$('.category').on('click', function (e) {
        var target = this;
        var buttons = [
            {
                text: 'All',
                onClick: () => {
                    category = 'All';
                    mainView.router.reloadPage({
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

    $('.bookmark-card').on('click', (e) => {
        let target = $(e.target).parent();
        $(target).toggleClass('active');
        socket.emit('bookmark-card', 'test'); 
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
    $$('#badge').hide();

    socket.on('currentstate', (_slideId, loopState) => {
        console.log('SlideId: ' + _slideId + ", " + loopState);
        socket.emit('currentstate', _slideId, loopState);
        slideId = _slideId;
    });
    socket.on('count bookmarkList', (amount) => {
        if(amount == 0) {
            $$('#badge').hide();
        }else {
            $$('#badge').show();
            $$('#badge').text(amount);
        }
        
        console.log('Count: ' + amount);
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
            socket.emit('tabbar bookmark', false);
        }else {
            $$('#bookmark').toggleClass('active');
            console.log('[click]bookmarked');
            socket.emit('tabbar bookmark', true);
        }
        
    });

    // Details page
    var slideId="#001",bookmark_list=[];

    $$('body').on('click', '.external-page', (e) => {
        let elem = $(e.srcElement);
        let url = elem.data('url');
        let newTab = window.open(url, '_system');
        newTab.focus();        
    });

    socket.on('bookmarkList', (_bookmarkList) => {
        _.forEach(_bookmarkList, function(value,key) {
            bookmark_list.push(_.get(value, 'id'));
            // for (var i = 0; i < bookmarkList.length; i++) {
            //     console.log(bookmarkList[i]);
            // }
        });
    });

    function initDetailsPage(page) {
        console.log("Navigated to details page.");
        console.log("slideId: " + slideId);
        var eventObj = _.find(event_list,{ 'id': slideId});

        var detailsHTML = Template7.templates.detailsTemplate(
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

        $$(page.container).find('.page-content').html(detailsHTML);

        // var mySwiper = myApp.swiper('.swiper-container', {
        //     pagination:'.swiper-pagination'
        // });

    }

    // BookmarkList page
    var eventJSON = [];
     $$('#bookmarkList-icon').on('click', () => {
        mainView.router.load({
            ignoreCache: true,
            pageName: 'bookmarkList'
        });
        
    });

    function renderBookmarkList(page) {
        page.view.router.refreshPage();
        console.log("Navigated to bookmark list");

        getBookmarkList(getUid())
            .then( data => _.filter(event_list, event => data.filter(d => d.id == event.id).length === 1))
            .then( responseEventList => {
                let bookmarkListHTML = Template7.templates.bookmarkListTemplate({ event_list: responseEventList});
                $$(page.container).find('.page-content').html(bookmarkListHTML);
            });
    }

    myApp.onPageInit('details', initDetailsPage);
    myApp.onPageReinit('details', initDetailsPage);

    myApp.onPageInit('bookmarkList', renderBookmarkList);
    myApp.onPageReinit('bookmarkList', renderBookmarkList);

    function getUid() {
        return localStorage.getItem('uid');
    }

    function getBookmarkList(uid) {
        return  $.ajax({
                    method: 'GET',
                    url: serverAddress + '/bookmarks',
                    data: {
                        uid: uid
                    }
                });
    }

    function addBookmark(uid, bookmarkId) {
        return  $.ajax({
                    method: 'POST',
                    url: serverAddress + '/bookmarks',
                    data: {
                        uid: uid,
                        bookmarkId: bookmarkId
                    }
                });
    }

    function deleteBookmark(uid, bookmarkId) {
        return  $.ajax({
                    method: 'DELETE',
                    url: serverAddress + '/bookmarks',
                    data: {
                        uid: uid,
                        bookmarkId: bookmarkId
                    }
                });
    }



// });