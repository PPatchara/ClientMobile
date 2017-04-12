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

$$('#badge').hide();

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

socket.on('bookmarkList', (_bookmarkList) => {
    _.forEach(_bookmarkList, function(value,key) {
        bookmark_list.push(_.get(value, 'id'));
    });
});

// BookmarkList page

function renderBookmarkList(page) {
    console.log("Navigated to bookmark list");

    getBookmarkList(getUid())
        .then( data => _.filter(event_list, event => data.filter(d => d.id == event.id).length === 1))
        .then( responseEventList => {
            let bookmarkListHTML = Template7.templates.bookmarkListTemplate({ event_list: responseEventList});
            $$(page.container).find('.page-content').html(bookmarkListHTML);
            return responseEventList;
        })
        .then( responseEventList => {
            $$('.bookmark-card').on('click', (e) => {
                let target = $(e.target).parent();
                var bookmarkId = $(target).data('id');
                console.log("bookmark-card: " + bookmarkId);
                deleteBookmark(getUid(), bookmarkId)
                    .then(response => {

                });
            });
        });
}

myApp.onPageInit('bookmarkList', renderBookmarkList);
myApp.onPageReinit('bookmarkList', renderBookmarkList);