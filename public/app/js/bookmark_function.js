function getBookmarkList() {
    return  $.ajax({
                method: 'GET',
                url: '/api/bookmarks'
            });
}

function addBookmark(bookmarkId) {
    console.log(`Adding bookmark=${bookmarkId}`)
    return  $.ajax({
                method: 'POST',
                url: '/api/bookmarks',
                data: {
                    bookmarkId: bookmarkId
                }
            });
}

function deleteBookmark(bookmarkId) {
    console.log(`Deleting bookmark=${bookmarkId}`)
    return  $.ajax({
                method: 'DELETE',
                url: '/api/bookmarks',
                data: {
                    bookmarkId: bookmarkId
                }
            });
}