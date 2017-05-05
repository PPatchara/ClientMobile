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
    let bookmarkButton = $('#bookmark, .bookmark-button');
    if (result.length !== 0) {
        console.log('added class active');
        bookmarkButton.addClass('active');
    } else {
        bookmarkButton.removeClass('active');
        console.log('removed class active');
    }
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
    isBookmark(slideId);
    
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
    }else {
        addBookmarkWithRender(slideId);
        socket.emit('tabbar bookmark', 'add');
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
        mainView.router.load({
            pageName: 'details'
        });
    });

    $$('.page-content').on('click', '.delete-card', (e) => {
        let bookmarkId = $(e.target).parent().data('id');
        deleteBookmarkWithRender(bookmarkId)
            .then(getEventListFromBookmarkList)
            .then(render);
    });

    console.log("render");
}

myApp.onPageInit('bookmarkList', initBookmarkListPage);
myApp.onPageReinit('bookmarkList', initBookmarkListPage);

function renderDetailsPage(page) {
    var eventObj = _.find(event_list,{ 'id': clickedBookmarkId});
    selectedId = clickedBookmarkId;
    isBookmark(selectedId);
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
    } else {
        addBookmarkWithRender(selectedId);
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

myApp.onPageInit('details', renderDetailsPage);
myApp.onPageReinit('details', renderDetailsPage);