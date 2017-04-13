var ICS = require('ics');

var ics = new ICS();

// var event001 = {
//   start: '2017-05-30 06:50',
//   end: '2017-05-30 15:00',
//   title: 'Test1',
//   description: 'Description1',
//   location: 'A1 Building',
//   url: 'http://www.google.com/'
//   // status: 'confirmed',
//   // geo: { lat: 40.0095, lon: 105.2669 },
//   // attendees: [
//   //   { name: 'Adam Gibbons', email: 'adam@example.com' },
//   //   { name: 'Brittany Seaton', email: 'brittany@example2.org' }
//   // ],
//   // categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO']
// }

// ics.buildEvent(event001);

// ics.createEvent(event001, {filepath: './public/calendars/event001.ics'}, function() {});

// var event002 = {
//   start: '2017-05-30 06:50',
//   end: '2017-05-30 15:00',
//   title: 'Test2',
//   description: 'Description2',
//   location: 'A2 Building',
//   url: 'http://www.google.com/'
// }

// ics.buildEvent(event002);

// ics.createEvent(event002, {filepath: './public/calendars/event002.ics'}, function() {});

// var event003 = {
//   start: '2017-05-30 06:50',
//   end: '2017-05-30 15:00',
//   title: 'Test3',
//   description: 'Description3',
//   location: 'A3 Building',
//   url: 'http://www.google.com/'
// }

// ics.buildEvent(event003);

// ics.createEvent(event003, {filepath: './public/calendars/event003.ics'}, function() {});

// var event004 = {
//   start: '2017-05-30 06:50',
//   end: '2017-05-30 15:00',
//   title: 'Test4',
//   description: 'Description4',
//   location: 'A4 Building',
//   url: 'http://www.google.com/'
// }

// ics.buildEvent(event004);

// ics.createEvent(event004, {filepath: './public/calendars/event004.ics'}, function() {});

var event005 = {
  start: '2017-05-30 06:50',
  end: '2017-05-30 15:00',
  title: 'Test5',
  description: 'Description5',
  location: 'A5 Building',
  url: 'http://www.google.com/'
}

ics.buildEvent(event005);

ics.createEvent(event005, {filepath: './public/calendars/event005.ics'}, function() {});