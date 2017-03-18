var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    morgan = require('morgan'),
    low = require('lowdb'),
    moment = require('moment'),
    helpers = require('./helpers');

const db = low('logs/db.json');
db.defaults({ users: [] }).write();

app.set('view engine', 'ejs');
// app.use(morgan('combined'))
app.use(express.static('public'));

http.listen(3000, () => {
    console.log('listening on *:3000');
});

// Routing
app.get('/', (req, res) => {
    res.render('pages/index');
});
app.get('/saved', (req, res) => {
    res.render('pages/saved');
});
app.get('/help', (req, res) => {
    res.render('pages/help');
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

// Large Display
io.on('connection', (socket) => {
    socket.on('largescreen state', (currentId, loopState) => {
        log('LargeScreen', currentId + ", " + loopState);
    });
    socket.on('detailed mode', (currentId) => {
        log('Detailed Mode', currentId);
        socket.broadcast.emit('detailed mode', currentId);
    });
});

// Mobile
io.on('connection', (socket) => {
    var alreadyJoined = false;

    socket.on('join', (data) => {
        if (alreadyJoined) return;

        var message;
        if (data.uid == undefined) {
            var uid = helpers.uniqueID();
            data.uid = uid;
            message = {
                'uid': uid,
                'status': 'new user'
            };
            log('Connection', 'New user has joined.');
            log('OS', data.os);
            // Add a user
            db.get('users').push({ id: uid, connections: [] }).write();
        } 
        else {
            message = {
                'uid': data.uid,
                'status': 'ok'
            };
            log('Connection', 'Exist user has joined. (' + data.uid + ')');
            log('OS', data.os);
        }

        socket.uid = data.uid;
        alreadyJoined = true;

        var time = moment().utc(420);
        db.get('users')
          .find({ id: data.uid })
          .get('connections')
          .push({ timestamp: time })
          .write();
        socket.emit('joined', message);
    });

    socket.on('gesture swipeleft', (gesture) => {
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swipeleft', gesture)
    });
    socket.on('gesture swiperight', (gesture) => {
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swiperight', gesture)
    });
    socket.on('gesture swipeup', (gesture) => {
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swipeup', gesture)
    });
    socket.on('gesture swipedown', (gesture) => {
        log('Gesture', gesture);
        socket.broadcast.emit('gesture swipedown', gesture)
    });
    socket.on('gesture doubletap', (gesture) => {
        log('Gesture', gesture);
        socket.broadcast.emit('gesture doubletap', gesture)
    });

    socket.on('bookmark', (data) => {
        log('bookmark', data);
    });

    socket.on('share', (channel) => {
        log('share', channel);
    });

    socket.on('disconnect', () => {
        log('Socket', 'user has disconnected.');
    });
});