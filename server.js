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

let key = '';
let isControlled = false;
let controllerId;
let aliveTime;
let renewCode;

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
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 157784760000}
}));

http.listen(80, () => {
    console.log('listening on *:80');
});

// Routing
app.get('/', (req, res) => {
    log('user-agent', req.useragent.platform);
    log('session.id', req.session.id);
    res.render('pages/ios/index_general');
    // if(['iPad', 'iPhone'].findIndex(platform => platform === req.useragent.platform) > -1) {
    //     res.render('pages/ios/index_general');
    // } else {
    //     res.render('pages/android/index_general');
    // }
});

app.get('/:key', (req, res) => {
    log('API:user-agent', req.useragent.platform);
    log('API:session.id', req.session.id);
    if ((!isControlled && key == req.params.key) || (isControlled && req.session.id == controllerId)) {
        res.render('pages/ios/index_control');
        isControlled = true;
        controllerId = req.session.id;
    } else {
        res.render('pages/ios/index_general');
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
    console.log('api bookmark: ' + JSON.stringify(req.session.id));
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
        return bookmarkList || [];
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
        if (bookmarkId !== undefined) {
            User.get('bookmarks').push({ id: bookmarkId }).write();
        };
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
    if (typeof(cookies) !== 'string') return
    let arr = cookies.split(';').map( c => {
        let value = c.split('='), obj = {};
        obj[value[0].trim()] = value[1].trim();
        return obj;
    });
    let merged = Object.assign(...arr);
    return merged;
}

function decodeUid(encodedUid) {
    if(encodedUid === undefined) {
        return '';
    }
    return encodedUid.slice(4, 40);
}

// Socket below
var slideId="#001",loopState='play';
var uid = null;
// Large Display
io.on('connection', (socket) => {
    socket.on('largescreen state', (_slideId, _loopState) => {
        log('LargeScreen', _slideId + ", " + _loopState);
        slideId = _slideId;
        loopState = _loopState;
        socket.broadcast.emit('currentstate', _slideId, _loopState);
    });
    socket.on('join large display', (data) => {
        key = helpers.generateKey();
        isControlled = false;
        console.log('Idle: ' + key);
        socket.emit('Generate Key', key);
    });
});

// Mobile
io.on('connection', (socket) => {
    var alreadyJoined = false;
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
                'status': 'new user',
                'isNewUser': true
            };
            log('Connection', 'New user has joined.');
            // Add a user
            db.get('users').push({ id: uid, connections: [], bookmarks: [], logs: [] }).write();

        } 
        else {
            message = {
                'uid': uid,
                'status': 'ok',
                'isNewUser': false
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
        socket.broadcast.emit('joined display', message);
        socket.emit('joined', message);
        socket.emit('currentstate', slideId);

        //Timer
        setAliveTime();
    });

    //Popup Tutorial
    socket.on('popup tutorial', (data) => {
//        setAliveTime();
        socket.broadcast.emit('popup tutorial', data);
    });

    //Touchpad
    socket.on('gesture swipeleft', (gesture) => {
//        setAliveTime();
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swipeleft', gesture);
    });
    socket.on('gesture swiperight', (gesture) => {
    //    setAliveTime();
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swiperight', gesture);
    });
    socket.on('gesture swipeup', (gesture) => {
    //    setAliveTime();
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swipeup', gesture);
    });
    socket.on('gesture swipedown', (gesture) => {
    //    setAliveTime();
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swipedown', gesture);
    });
    socket.on('gesture press', (gesture) => {
    //    setAliveTime();
        log('Gesture', gesture);
        socket.broadcast.emit('gesture press', gesture);
    });
    socket.on('currentstate', (_slideId, _loopState) => {
        console.log('SlideId: ' + _slideId + ", " + _loopState);
    });
    socket.on('toggle play', (toggleState) => {
        socket.broadcast.emit('toggle play', toggleState);
    });
    socket.on('toggle pause', (toggleState) => {
        socket.broadcast.emit('toggle pause', toggleState);
    });

    socket.on('toggle played', () => {
       socket.broadcast.emit('toggle played');
    });

    socket.on('toggle paused', () => {
        socket.broadcast.emit('toggle paused');
    });


    //Tab bar
    socket.on('tabbar bookmark', (data) => {
        if (data === 'add') {
            socket.broadcast.emit('bookmarked', 'bookmarked');
        } else {
            socket.broadcast.emit('unbookmarked', 'unbookmarked');
        }
//        setAliveTime();
        log('tabbar bookmark', data);
    });

    socket.on('tabbar share', (channel) => {
//        setAliveTime();
        log('tabbar share', channel);
    });

    socket.on('tabbar help', (data) => {
//        setAliveTime();
        log('tabbar help', data);
    });

    // socket.on('tabbar calendar', (state) => {
    //     setAliveTime();
    //     log('tabbar calendar', state);
    // });

    socket.on('connection status', (status) => {
        if (status == 'inactive') {
            key = helpers.generateKey();
            socket.broadcast.emit('Generate Key', key); //display
            clearAlive();
            console.log('After inactive: ' + key);
            log('connection status', 'inactive');
        }else if (status == 'timeout') {
            socket.broadcast.emit('connection status display','timeout');
        }
    });

    socket.on('verify renew code', (code) => {
        if (renewCode == code) {
            clearTimeout(warningTime);
            setAliveTime();
            socket.broadcast.emit('renew verified', true);
            console.log('[verify renew code]');
        }else if (code == 'cancel') {
            socket.broadcast.emit('renew verified', 'cancel');
        }
    });

    function setAliveTime() {
        clearAlive();
        aliveTime = setTimeout(alertWarning, 60000);
        socket.broadcast.emit('log setAliveTime', 'setAliveTime');
    }

    function alertWarning() {
        renewCode = helpers.generateRenewCode();
        console.log('Renew code: ' + renewCode);
        socket.emit('connection status', 'warning'); //mobile
        
        socket.broadcast.emit('renew code', renewCode); //display
        warningTime = setTimeout(inactiveStatus, 30000);
    }

    function inactiveStatus() {
      console.log("[Alive status]: Inactive!!!!!");
      generateKey();
      socket.emit('connection status', 'inactive'); //mobile
      socket.broadcast.emit('connection status display', 'inactive'); //display
      socket.broadcast.emit('log disconnect', 'inactive');
      isControlled = false;
    }

    function clearAlive() {
        clearTimeout(aliveTime);
    }

    function generateKey() {
        key = helpers.generateKey();
        socket.broadcast.emit('Generate Key', key);
        console.log('After inactive: ' + key);
    }
});

function event_log(socket, event, data) {
    let cookies = parseCookies(socket.request.headers.cookie);
    let uid = decodeUid(cookies['connect.sid']);
    let User = db.get('users').find({ id: uid });
    let logs = User.get('logs').value();
    if (logs === undefined) {
        console.log(`${uid}: ${event} ${data}`);
        db.get('users').find({ id: uid }).assign({ logs: [] }).write();
    }
    const time = moment().utc(420);
    User.get('logs')
        .push({ event: event, data: data, timestamp: time })  
        .write();
}

//
io.on('connection', (socket) => {
    socket.on('log gesture', (log) => {
        event_log(socket, 'gesture', log);
    });
    socket.on('log tabbar', (log) => {
        event_log(socket, 'tabbar', log); 
    });
    socket.on('log bookmarkList', (log) => {
        event_log(socket, 'bookmarkList', log);
    });
    socket.on('log bookmark-card', (log) => {
        event_log(socket, 'bookmark-card', log);
    });
    socket.on('log acquire-details', (log) => {
        event_log(socket, 'log acquire-details', log);
    });
    socket.on('log disconnect', (log) => {
        event_log(socket, 'log disconnect', log);
    });
    socket.on('log setAliveTime', (log) => {
        event_log(socket, 'log setAliveTime', log);
    });

});

