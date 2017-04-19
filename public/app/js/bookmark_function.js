function getBookmarkList() {
    return  $.ajax({
                method: 'GET',
                url: serverAddress + '/bookmarks'
            });
}

function addBookmark(bookmarkId) {
    console.log(`Adding bookmark=${bookmarkId}`)
    return  $.ajax({
                method: 'POST',
                url: serverAddress + '/bookmarks',
                data: {
                    bookmarkId: bookmarkId
                }
            });
}

function deleteBookmark(bookmarkId) {
    console.log(`Deleting bookmark=${bookmarkId}`)
    return  $.ajax({
                method: 'DELETE',
                url: serverAddress + '/bookmarks',
                data: {
                    bookmarkId: bookmarkId
                }
            });
}