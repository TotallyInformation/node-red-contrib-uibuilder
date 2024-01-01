let crypto;
try {
  crypto = require('node:crypto');
} catch (err) {
  console.log('crypto support is disabled!');
}
// const options = {}
// crypto.randomUUID(options)
// crypto.randomUUID()
