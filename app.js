// system libs
const args = require('yargs').argv

// internal libs
const remotex = require('./js/remotex.js')
const configLib = require('./js/config.js')

// args
const command = args._[0]
const arg1 = args._[1]
const arg2 = args._[2]
const arg3 = args._[3]

// command case
switch (command)
{

  //
  // MAIN COMMAND
  // STARTING REMOTEX
  //

  // start remotex daemon
  // TODO: pre-hash commands to listen for
  case 'daemon':
    remotex.init()
  break

  //
  // 'CLIENT' COMMANDS
  // CONNECTIONS ARRAY SHOULD NOT BE EMPTY
  // WE USE THE RESOLVE FUNCTIONS HERE
  //

  // exec command in either remote or local (peer passed as arg1)
  // pass a bash script or json
  // have special binaries inside a bin folder in RemoteX
  // each whitelisted peer have their own jail folder for files
  // remotex run <friendlyname> <command or script file in scripts folder>
  case 'run':
  break

  //
  // CONFIG COMMANDS
  // ADDING OR REMOVING CONNECTIONS AND WHITELIST
  // FRIENDLY NAME IS OPTIONAL
  //

  // connections; for client mode; list, add, remove
  // this should call configLib
  // remotex connections add peerid friendlyname
  // remotex connections remove peerid
  // remotex connections
  case 'connections':
  break

  // whitelist; for server mode; list, add, remove
  // this should call configLib
  // remotex whitelist add peerid friendlyname
  // remotex whitelist remove peerid
  // remotex whitelist
  case 'whitelist':
  break

  // default
  default:
    // do nothing; print out available commands

}
