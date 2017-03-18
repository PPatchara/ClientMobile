var low = require('lowdb');

const db = low('test.json');

db.defaults({ posts: [], user: {} })
  .write()

// // Add a post
// db.get('posts')
//   .push({ id: 1, title: 'lowdb is awesome'})
//   .write()

// Set a user
db.set('user.name', 'typicode')
  .write()

// var post = db.get('posts')
// 			  .find({ id: 1 })
// 			  .value()

// console.log(post);