var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    morgan = require('morgan'),
    low = require('lowdb'),
    moment = require('moment'),
    helpers = require('./helpers'),
    useragent = require('express-useragent');


const db = low('logs/db.json');
db.defaults({ users: [] }).write();

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(useragent.express());

http.listen(3000, () => {
    console.log('listening on *:3000');
});

// Routing
app.get('/', (req, res) => {
    log('user-agent', req.useragent.platform);
    // if(['iPad', 'iPhone'].findIndex(platform => platform === req.useragent.platform) > -1) {
        res.render('pages/ios/index');
    // } else {
    //     res.render('pages/android/index');
    // }
    
});
app.get('/saved', (req, res) => {
    res.render('pages/ios/saved');
});
app.get('/help', (req, res) => {
    res.render('pages/ios/help');
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

// Socket below
var currentSlide = "";

// Large Display
io.on('connection', (socket) => {
    socket.on('largescreen state', (currentId, loopState) => {
        log('LargeScreen', currentId + ", " + loopState);
        currentSlide = currentId;
        socket.broadcast.emit('currentstate', currentId, loopState);
    });
    socket.on('detailed mode', (currentId) => {
        log('Detailed Mode', currentId);
        socket.broadcast.emit('detailed mode', currentId);
    });

});

// Mobile
io.on('connection', (socket) => {
    var alreadyJoined = false;
    var uid = null;
    var User = null;

    socket.on('join', (data) => {
        if (alreadyJoined) return;

        var message;
        if (data.uid == undefined) {
            data.uid = helpers.uniqueID();
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
                'uid': data.uid,
                'status': 'ok'
            };
            log('Connection', 'Exist user has joined. (' + data.uid + ')');
        }

        alreadyJoined = true;
        uid = data.uid;
        User = db.get('users').find({ id: uid });

        // Record joined timestamp
        var time = moment().utc(420);
        User.get('connections')
            .push({ timestamp: time })
            .write();
        socket.emit('joined', message);
        isBookmark(uid, currentSlide);
    });

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
        addBookmark(uid,currentSlide);
    });

    socket.on('currentstate', (currentId, loopState) => {
        console.log('CurrentId: ' + currentId + ", " + loopState);
        isBookmark(uid, currentId);
    });

    socket.on('bookmark', (data) => {
        if(data){
            addBookmark(uid, currentSlide);
        }else {
            deleteBookmark(uid, currentSlide);
        }
    });

    socket.on('share', (channel) => {
        log('share', channel);
    });

    socket.on('disconnect', () => {
        log('Socket', 'user has disconnected.');
    });

    function isBookmark(uid, bookmarkId) {
        var bookmark = User.get('bookmarks').value();
        if (bookmark === undefined) {
            socket.emit('unbookmarked', 'unbookmarked');
            return false;
        }

        if (User.get('bookmarks').find({id: bookmarkId}).value() == undefined) {
            socket.emit('unbookmarked', 'unbookmarked');
            return true;
        }else if(User.get('bookmarks').find({id: bookmarkId}).value() !== undefined) {
            socket.emit('bookmarked', 'bookmarked');
            return false;
        }
    }

    function addBookmark(uid, bookmarkId) {
        var bookmark = User.get('bookmarks').value();
        if (bookmark === undefined) {
            User.assign({ bookmarks: [] }).write();
        }
        if (User.get('bookmarks').find({id: bookmarkId}).value() !== undefined) {
            log('bookmark', `Cannot bookmark ` + bookmarkId + ` is already in bookmark list`);
            socket.emit('bookmarked', 'bookmarked');
            log('send');
            return;
        }
        User.get('bookmarks').push({ id: bookmarkId }).write();
        socket.emit('bookmarked', 'bookmarked');
    }

    function deleteBookmark(uid, bookmarkId) {
        db.get('users').find({ id: uid }).get('bookmarks').remove({id: bookmarkId}).write();
    }

});

