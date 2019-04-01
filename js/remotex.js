// system libs
const chalk = require('chalk')

// internal libs
const configLib = require('./config.js')
const cryptoLib = require('./crypto.js')
const ipfsLib = require('./ipfs.js')
const relayLib = require('./relay.js')

// init app
var init = () =>
{
  console.log(` ${chalk.gray("###########")}`)
  console.log(` ${chalk.gray("#")} ${chalk.bold("RemoteX")} ${chalk.gray("#")}`)
  console.log(` ${chalk.gray("###########")}\n`)
  console.log(` Send/receive commands and processes remotely from multiple systems`)
  console.log(` Powered by the IPFS network\n`)
  console.log(` By: Jensel Gatchalian <jensel.gatchalian@gmail.com>\n`)

  console.log(` ${chalk.gray('---')} Starting RemoteX...\n`)

  // wait for config init
  if (configLib.init())
  {

      // init crypto
      cryptoLib.init()

      // init IPFS
      ipfsLib.init()

      // init relay
      relayLib.init()

  }
  else
  {
    console.log(` ${chalk.redBright('---')} RemoteX halted! Please check logs for information.`)
  }

}

// function exports
module.exports =
{
  init
}
