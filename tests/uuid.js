let crypto;
try {
  crypto = require('node:crypto');
} catch (err) {
  console.log('crypto support is disabled!');
}
const { nanoId } = require('../nodes/libs/uiblib.js')
// const options = {}
// crypto.randomUUID(options)
// console.log(crypto.randomUUID())
console.log( nanoId() )
