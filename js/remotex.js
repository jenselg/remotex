// internal libs
const configLib = require('./config.js')
const cryptoLib = require('./crypto.js')
const ipfsLib = require('./ipfs.js')
const relayLib = require('./relay.js')


// init app
var init = () =>
{

  // init config
  configLib.init()

  // init crypto
  cryptoLib.init()

  // init IPFS
  ipfsLib.init()

  // init relay
  relayLib.init()

}

// function exports
module.exports =
{
  init
}
