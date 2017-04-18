var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    morgan = require('morgan'),
    low = require('lowdb'),
    moment = require('moment'),
    helpers = require('./helpers'),
    bodyParser = require('body-parser'),
    useragent = require('express-useragent'),
    session = require('express-session'),
    SQLiteStore = require('connect-sqlite3')(session),
    url = require('url');

const db = low('logs/db.json');
db.defaults({ users: [] }).write();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(useragent.express());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    store: new SQLiteStore,
    secret: '#spicy shrimp sup',
    genid: function(req) {
        return helpers.uniqueID();
    },
}));

http.listen(3000, () => {
    console.log('listening on *:3000');
});

// Routing
app.get('/', (req, res) => {
    var user = req.query.user;
    log('user', user);
    log('user-agent', req.useragent.platform);
    log('session.id', req.session.id);
    // if(['iPad', 'iPhone'].findIndex(platform => platform === req.useragent.platform) > -1) {
    //    res.render('pages/ios/index');
    // } else {
    //     res.render('pages/android/index');
    // }
    if(user === 'true') {
        res.render('pages/ios/index_general');
    } else {
        res.render('pages/ios/index_control'); 
    }
    
});

app.get('/bookmarkList', (req, res) => {
    res.render('pages/ios/bookmarkList');
});

app.get('/help', (req, res) => {
    res.render('pages/ios/help');
});

app.get('/api/bookmarks', (req, res) => {
    let bookmarkList = bookmarkService.getBookmarkListByUid(req.session.id);
    res.json({
        status: "ok",
        content: bookmarkList,
        count: bookmarkList.length
    });
});

app.post('/api/bookmarks', (req, res) => {
    let response = bookmarkService.addBookmark(req.session.id, req.body.bookmarkId);
    res.json(response);
});

app.delete('/api/bookmarks', (req, res) => {
    let response = bookmarkService.deleteBookmark(req.session.id, req.body.bookmarkId);
    res.json(response);
});

app.post('/api/slide/toleft', (req, res) => {
    let result = bookmarkService.getBookmarkById(req.session.id, slideId);
    res.json({
        status: "ok",
        isBookmark: result
    });
});

app.post('/api/slide/toright', (req, res) => {
    let result = bookmarkService.getBookmarkById(req.session.id, slideId);
    res.json({
        status: "ok",
        isBookmark: result
    });
});


function log(topic, message) {
    console.log('[' + topic + ']: ' + message);
}

var unpacked = {
    name    : 'Asia/Bangkok',
    abbrs   : ['ICT'],
    untils  : [null],
    offsets : [-420]
};

// Bookmark Service
var bookmarkService = {
    getBookmarkById: function(uid, bookmarkId) {
        let User = db.get('users').find({ id: uid });
        var bookmark = User.get('bookmarks').find({ id: bookmarkId }).value();
        return bookmark;
    },
    getBookmarkListByUid: function(uid) {
        let User = db.get('users').find({ id: uid });
        let bookmarkList = User.get('bookmarks').value();
        return bookmarkList;
    },
    addBookmark: function(uid, bookmarkId) {
        let User = db.get('users').find({ id: uid });
        var bookmark = User.get('bookmarks').value();
        if (bookmark === undefined) {
            User.assign({ bookmarks: [] }).write();
        }
        if (this.getBookmarkById(uid, bookmarkId) !== undefined) {
            log('bookmark', bookmarkId + ` is already in bookmark list`);
            return {
                "status": "error",
                "msg": bookmarkId + " is already in bookmark list"
            };
        }
        User.get('bookmarks').push({ id: bookmarkId }).write();
        let bookmarkList = this.getBookmarkListByUid(uid);
        return {
            status: "ok",
            content: bookmarkList,
            count: bookmarkList.length
        }
    },
    deleteBookmark: function(uid, bookmarkId) {
        log('deleteBookmark', `uid=${uid}, bookmarkId=${bookmarkId}`);
        db.get('users').find({ id: uid }).get('bookmarks').remove({id: bookmarkId}).write();
        let bookmarkList = this.getBookmarkListByUid(uid);
        return {
            status: "ok",
            content: bookmarkList,
            count: bookmarkList.length
        }
    }
}

function parseCookies(cookies) {
    let arr = cookies.split(';').map( c => {
        let value = c.split('='), obj = {};
        obj[value[0].trim()] = value[1].trim();
        return obj;
    });
    let merged = Object.assign(...arr);
    return merged;
}

function decodeUid(encodedUid) {
    return encodedUid.slice(4, 40);
}

// Socket below
var slideId = "#001";

// Large Display
io.on('connection', (socket) => {
    socket.on('largescreen state', (_slideId, _loopState) => {
        log('LargeScreen', _slideId + ", " + _loopState);
        slideId = _slideId;
        socket.broadcast.emit('currentstate', _slideId, _loopState);
    });

});

// Mobile
io.on('connection', (socket) => {
    var alreadyJoined = false;
    var uid = null;
    var User = null;

    socket.on('join', (data) => {
        if (alreadyJoined) return;

        // console.log(socket.request.headers.cookie);
        let cookies = parseCookies(socket.request.headers.cookie);
        uid = decodeUid(cookies['connect.sid']);

        var message;
        if (db.get('users').find({ id: uid }).value() == undefined) {
            message = {
                'uid': uid,
                'status': 'new user'
            };
            log('Connection', 'New user has joined.');
            // Add a user
            db.get('users').push({ id: uid, connections: [], bookmarks: [] }).write();
        } 
        else {
            message = {
                'uid': uid,
                'status': 'ok'
            };
            log('Connection', 'Exist user has joined. (' + uid + ')');
        }

        alreadyJoined = true;
        User = db.get('users').find({ id: uid });

        // Record joined timestamp
        var time = moment().utc(420);
        User.get('connections')
            .push({ timestamp: time })
            .write();
        // socket.emit('joined', message);
        socket.emit('currentstate', slideId, 'enable');
    });

    //Touchpad
    socket.on('gesture swipeleft', (gesture) => {
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swipeleft', gesture);
    });
    socket.on('gesture swiperight', (gesture) => {
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swiperight', gesture);
    });
    socket.on('gesture swipeup', (gesture) => {
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swipeup', gesture);
    });
    socket.on('gesture swipedown', (gesture) => {
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swipedown', gesture);
    });
    socket.on('gesture doubletap', (gesture) => {
        log('Gesture', gesture);
        socket.broadcast.emit('gesture doubletap', gesture);
        bookmarkService.addBookmark(uid,slideId);
    });

    socket.on('currentstate', (_slideId, loopState) => {
        console.log('SlideId: ' + _slideId + ", " + loopState);
    });

    socket.on('client bookmark', (data) => {
        if (data === 'add') {
            socket.broadcast.emit('bookmarked', 'bookmarked');
        } else {
            socket.broadcast.emit('unbookmarked', 'unbookmarked');
        }
    });

    //Tab bar
    // socket.on('tabbar bookmark', (data) => {
    //     if(data){
    //         bookmarkService.addBookmark(uid, slideId);
    //         socket.broadcast.emit('bookmarked', 'bookmarked');
    //     }else {
    //         deleteBookmark(uid, slideId);
    //         socket.broadcast.emit('unbookmarked', 'unbookmarked');
    //     }
    // });

    socket.on('tabbar share', (channel) => {
        log('tabbar share', channel);
        socket.broadcast.emit('share', 'shared');
    });

    // socket.on('tabbar calendar', (state) => {
    //     log('tabbar calendar', data);
    //     socket.broadcast.emit('calendar', 'addCalendar');
    // });

    socket.on('tabbar disconnect', () => {
        log('Socket', 'user has disconnected.');
    });

    //Bookmarklist
    // socket.on('bookmark-card unbookmarked', (bookmarkId) => {
    //     bookmarkService.deleteBookmark(uid,bookmarkId);
    //     console.log("delete: " + bookmarkId);
    // });\
});

