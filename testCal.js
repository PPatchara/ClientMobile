var ICS = require('ics');

var ics = new ICS();

var attributes = {
  start: '2017-05-30 06:50',
  end: '2017-05-30 15:00',
  title: 'Bolder Boulder',
  description: 'Annual 10-kilometer run in Boulder, Colorado',
  location: 'Folsom Field, University of Colorado (finish line)',
  url: 'http://www.bolderboulder.com/',
  status: 'confirmed',
  geo: { lat: 40.0095, lon: 105.2669 },
  attendees: [
    { name: 'Adam Gibbons', email: 'adam@example.com' },
    { name: 'Brittany Seaton', email: 'brittany@example2.org' }
  ],
  categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO']
}

ics.buildEvent(attributes);

ics.createEvent(attributes, {filepath: './public/calendars/event.ics'}, function() {});