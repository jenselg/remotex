// system libs
const fsLib = require('fs')
const osLib = require('os')
const args = require('yargs').argv
const chalk = require('chalk')

// directories
const homeDir = osLib.homedir()
const dataDir = homeDir + '/RemoteX'
const execDir = dataDir + '/exec'

// files
const configFile = dataDir + '/config.json'
const receiveProcessFile = dataDir + '/receive-process.json'
const sendProcessFile = dataDir + '/send-process.json'

// internal libs
const remotex = require('./js/remotex.js')
const configLib = require('./js/config.js')
const processLib = require('./js/process.js')

// args
const command = args._[0]
const arg1 = args._[1]
const arg2 = args._[2]
const arg3 = args._[3]

// command case
switch (command)
{

  //*********************************************************************
  // MAIN COMMANDS
  //*********************************************************************

  // start remotex daemon
  // run on its own terminal
  // TODO: pre-hash commands to listen for (wayyy later)
  case 'daemon':
    remotex.init()
  break

  // check if remotex daemon is running
  // print id either way
  // print if it's been run at least once or not
  // print if proper folders exist
  // print if repo has lock but not running (unclean shutdown of ipfs)
  case 'status':
  break

  // fix any errors such as repo lock folder
  // corrupted config file check
  // clear error flag
  case 'fix':
  break

  //*********************************************************************
  // CONFIG COMMANDS
  // ADDING OR REMOVING CONNECTIONS AND WHITELIST
  // FRIENDLY NAME IS OPTIONAL
  //*********************************************************************

  // connections; for client mode; list, add, remove
  // this should call configLib
  // if no friendlyname is provided use peerid
  // remotex connections add peerid friendlyname
  // remotex connections remove peerid
  // remotex connections
  case 'connections':

    switch (arg1)
    {

      // add peer to connect to
      case 'add':
        configLib.connections('add', arg2)
      break

      // remove peer to connect to
      case 'remove':
        configLib.connections('remove', arg2)
      break

      // list connections
      case 'list':
        var counter = 1
        var connections = configLib.connections('list')
        if (connections.length > 0)
        {
          console.log('')
          console.log(chalk.white('Connections list:'))
          connections.forEach((value, index) => {
            console.log(`${chalk.gray(counter + index + '.')} ${chalk.yellowBright(value)}`)
            counter += 1
          })
          console.log('')
        }
        else
        {
          console.log(chalk.redBright('\nConnections list is empty!\n'))
        }
      break

      // fallthrough
      default:
        console.log('')
        console.log('Connections command usage:')
        console.log('remotex connections add <peer>')
        console.log('remotex connections remove <peer>')
        console.log('remotex connections list')
        console.log('')

    }

  break

  // whitelist; for server mode; list, add, remove
  // this should call configLib
  // if no friendlyname is provided use peerid
  // remotex whitelist add peerid friendlyname
  // remotex whitelist remove peerid
  // remotex whitelist
  case 'whitelist':

    switch (arg1)
    {

      // add peer to whitelist
      case 'add':
        configLib.whitelist('add', arg2)
      break

      // remove peer from whitelist
      case 'remove':
        configLib.whitelist('remove', arg2)
      break

      // list connections
      case 'list':
        var counter = 1
        var whitelist = configLib.whitelist('list')
        if (whitelist.length > 0)
        {
          console.log('')
          console.log(chalk.white('Whitelist:'))
          whitelist.forEach((value, index) => {
            console.log(`${chalk.gray(counter + index + '.')} ${chalk.yellowBright(value)}`)
            counter += 1
          })
          console.log('')
        }
        else
        {
          console.log(chalk.redBright('\nWhitelist is empty!\n'))
        }
      break

      // fallthrough
      default:
        console.log('')
        console.log('Whitelist command usage:')
        console.log('remotex whitelist add <peer>')
        console.log('remotex whitelist remove <peer>')
        console.log('remotex whitelist list')
        console.log('')

    }

  break

  //*********************************************************************
  // 'CLIENT' COMMANDS
  // CONNECTIONS ARRAY SHOULD NOT BE EMPTY
  //*********************************************************************

  case 'process':

    

  break

  default:

    // 1. get connections list
    // 2. if user did 'remotex <peerHash> <hash/command> <QmHash/Command>'

}
