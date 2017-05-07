function getBookmarkListWithRender() {
    return  getBookmarkList()
                .then(reInitVariable)
                .then(rerender);
}

var selectedId;
var dataBookmarkList = {
    count: 0,
    content: []
};

function reInitVariable(data) {
    if (data.status === 'ok') {
        dataBookmarkList.count = data.count;
        dataBookmarkList.content = data.content;
        console.log(`data changed: dataBookmarkList= ${JSON.stringify(dataBookmarkList)}`);    
    }
    
    return dataBookmarkList;
}

function isBookmark(selectedId) {
    let result = dataBookmarkList.content.filter(d => d.id === selectedId);
    return result.length !== 0;
}

function rerender(data) {
    console.log("Rerendering...");
    function badge() {
        if(dataBookmarkList.count === 0) {
            $$('#badge').hide();
        }else {
            $$('#badge').show();
        }
        $$('#badge').text(dataBookmarkList.count);
    }

    badge();
    if ((typeof(slideId)) !== 'undefined') {
        let bookmarkButton = $('#bookmark');
        if (isBookmark(slideId)) {
            bookmarkButton.addClass('active');
        } else {
            bookmarkButton.removeClass('active');
        }
    } 

        let bookmarkButton = $('.bookmark-button');
        if (isBookmark(selectedId)) {
            console.log('Bookmarked');
            bookmarkButton.addClass('active');
        } else {
            console.log('Unbookmarked');
            bookmarkButton.removeClass('active');
        }
    
    return data;
}

function addBookmarkWithRender(bookmarkId) {
    console.log(`AddingWithRender bookmark=${bookmarkId}`)
    return  addBookmark(bookmarkId)
                .then(reInitVariable)
                .then((data) => {
                    console.log(`Added bookmark=${bookmarkId}`)
                    socket.emit('client bookmark', 'add');
                    return data;
                })
                .then(rerender)
}

function deleteBookmarkWithRender(bookmarkId) {
    console.log(`Deleting bookmark=${bookmarkId}`)
    return  deleteBookmark(bookmarkId)
                .then(reInitVariable)
                .then(rerender)
                .then((data) => {
                    console.log(`Deleted bookmark=${bookmarkId}`)
                    socket.emit('client bookmark', 'delete');
                    return data;
                });
}

$$('#bookmark').on('click', () => {
    if($$('#bookmark').hasClass('active')) {
        deleteBookmarkWithRender(slideId);
        socket.emit('tabbar bookmark', 'delete');
        socket.emit('log tabbar', 'unbookmarked, ' + slideId);
    }else {
        addBookmarkWithRender(slideId);
        socket.emit('tabbar bookmark', 'add');
        socket.emit('log tabbar', 'bookmarked, ' + slideId);
    }
});

// BookmarkList page
var clickedBookmarkId;

function initBookmarkListPage(page) {
    renderBookmarkListPage(page);
}

function renderBookmarkListPage(page) {
    function getEventListFromBookmarkList(data) {
        return _.filter(event_list, event => data.content.filter(d => d.id == event.id).length === 1);
    }

    let render = (responseEventList) => {
        if (dataBookmarkList.count != 0) {
            let bookmarkListHTML = Template7.templates.bookmarkListTemplate({ event_list: responseEventList});
            $$(page.container).find('.page-content').html(bookmarkListHTML);
        }else {
            $$(page.container).find('.page-content').html(`
                <div class="content-block color-black" style="margin-top: 20px; text-align: center;">
                    <div class="empty-layout">
                        <i class="f7-icons size-40">bookmark_fill</i>
                        <h2 class="h2-light">Nothing Here</h2>
                        <p style="padding: 0 20px 0 20px;">Bookmark events you want to see again.</p>
                    </div>
                </div>
            `);
        }

        return responseEventList;
    }

    console.log("Navigated to bookmark list");

    getBookmarkListWithRender()
        .then(getEventListFromBookmarkList)
        .then(render);

    $$('.page-content').on('click', '.card-content', (e) => {
        clickedBookmarkId = $$(e.target).parents('li.card').data('id');
        console.log(clickedBookmarkId);
        socket.emit('log bookmark-card', 'clicked, ' + clickedBookmarkId);
        mainView.router.load({
            pageName: 'details'
        });
    });

    $$('.page-content').on('click', '.delete-card', (e) => {
        let bookmarkId = $(e.target).parent().data('id');
        socket.emit('log bookmark-card', 'unbookmarked, ' + bookmarkId);
        deleteBookmarkWithRender(bookmarkId)
            .then(getEventListFromBookmarkList)
            .then(render);
    });

    console.log("render");
}

myApp.onPageInit('bookmarkList', initBookmarkListPage);
myApp.onPageReinit('bookmarkList', initBookmarkListPage);

function renderBookmarkButton() {
    let bookmarkButton = $('.bookmark-button');
    if (isBookmark(selectedId)) {
        console.log('Bookmarked');
        bookmarkButton.addClass('active');
    } else {
        console.log('Unbookmarked');
        bookmarkButton.removeClass('active');
    }
}

function renderDetailsPage(page) {
    function renderBookmarkButton() {

    }
    var eventObj = _.find(event_list,{ 'id': clickedBookmarkId});
    selectedId = clickedBookmarkId;
    let bookmarkButton = $('.bookmark-button');
    if (isBookmark(selectedId)) {
        bookmarkButton.addClass('active');
    } else {
        bookmarkButton.removeClass('active');
    }
    console.log('detail: ' + eventObj);
    var detailsHTML = Template7.templates.detailsTemplate(
        {
            id: _.get(eventObj, 'id'),
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

    $$(page.container).find('.page-content').html(detailsHTML);

}

$$('.page[data-page=acquire], .page[data-page=details]').on('click', '.bookmark-button', (e) => {
    console.log(`[Click] .bookmark-button | with id ${selectedId}`);
    let bookmarkButton = $('.bookmark-button');
    if (bookmarkButton.hasClass('active')) {
        deleteBookmarkWithRender(selectedId);
        socket.emit('log acquire-details', 'unbookmarked, ' + selectedId);
    } else {
        addBookmarkWithRender(selectedId);
        socket.emit('log acquire-details', 'bookmarked, ' + selectedId);
    }
});
$$('.page[data-page=acquire], .page[data-page=details]').on('click', '.share-button', (e) => {
    console.log(`[Click] .share-button | with id ${selectedId}`);
    let event = EventListService.get(selectedId);
    var buttonShare = [
        {
            text: 'Share',
            label: true
        },
        {
            text: 'Email',
            onClick: () => {
                socket.emit('tabbar share', 'email');
                socket.emit('log acquire-details', 'share, ' + selectedId + ', email');
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
                socket.emit('log acquire-details', 'share, ' + selectedId + ', facebook');
                let url = event.share.facebook;
                var newTab = window.open(url, '_blank');
                newTab.focus();
            }
        },
        {
            text: 'Google+',
            onClick: () => {
                socket.emit('tabbar share', 'google+');
                socket.emit('log acquire-details', 'share, ' + selectedId + ', google+');
                let url = event.share.googleplus;
                var newTab = window.open(url, '_blank');
                newTab.focus();
            }
        },
        {
            text: 'Twitter',
            onClick: () => {
                socket.emit('tabbar share', 'twitter');
                socket.emit('log acquire-details', 'share, ' + selectedId + ', twitter');
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

myApp.onPageInit('details', renderDetailsPage);
myApp.onPageReinit('details', renderDetailsPage);