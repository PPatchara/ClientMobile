function uniqueID() {
  function chr4() {
    return Math.random().toString(16).slice(-4);
  }
  return chr4() + chr4() +
    '-' + chr4() +
    '-' + chr4() +
    '-' + chr4() +
    '-' + chr4() + chr4() + chr4();
}

function generateKey() {
  return Math.random().toString(16).slice(-4);
}

module.exports = {
	uniqueID: uniqueID,
	generateKey: generateKey
}

