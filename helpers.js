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

function generateRenewCode() {
  return Math.floor(1000 + Math.random() * 9000);
}

module.exports = {
	uniqueID: uniqueID,
	generateKey: generateKey,
  generateRenewCode: generateRenewCode
}

