// internal libs
const configLib = require('./config.js')
const cryptoLib = require('./crypto.js')
const ipfsLib = require('./ipfs.js')
const relayLib = require('./relay.js')

// init app
var init = () =>
{

  console.log('\n RemoteX\n')
  console.log(' Send/receive commands and processes remotely from multiple systems')
  console.log(' Powered by the IPFS network\n')
  console.log(' By: Jensel Gatchalian <jensel.gatchalian@gmail.com>')
  console.log('\n - Starting RemoteX...\n')

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
