// system libs
const fsLib = require('fs')
const osLib = require('os')
const NodeRSA = require('node-rsa');

// directories
const homeDir = osLib.homedir()
const dataDir = homeDir + '/RemoteX'

var init = () =>
{

}

// export functions
module.exports =
{
  init
}
