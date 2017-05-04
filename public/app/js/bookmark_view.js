function getBookmarkListWithRender() {
    return  getBookmarkList()
                .then(reInitVariable)
                .then(rerender);
}

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

    function isBookmark() {
        let result = dataBookmarkList.content.filter(d => d.id === slideId);
        if (result.length !== 0) {
            console.log('added class active');
            $('#bookmark').addClass('active');
        } else {
            $('#bookmark').removeClass('active');
            console.log('removed class active');
        }
        
    }

    badge();
    isBookmark();
    
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


function initBookmarkListPage(page) {
    renderBookmarkListPage(page);
}

function renderBookmarkListPage(page) {
    function getEventListFromBookmarkList(data) {
        return _.filter(event_list, event => data.content.filter(d => d.id == event.id).length === 1);
    }

    let render = (responseEventList) => {
        // let bookmarkListHTML = Template7.templates.bookmarkListTemplate({ event_list: responseEventList});
        // $$(page.container).find('.page-content').html(bookmarkListHTML);

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
        let clickedBookmarkId = $$(e.target).parents('li.card').data('id');
        console.log(clickedBookmarkId);
        mainView.router.load({
            pageName: 'details',
            context: EventListService.get(clickedBookmarkId)
        });
        // mainView.router.load({
        //     template: Template7.templates.detailsTemplate,
        //     context: EventListService.get(clickedBookmarkId)
        // });
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

