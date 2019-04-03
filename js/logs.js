// system libs
const fsLib = require('fs')
const osLib = require('os')

// directories
const logDir = dataDir + '/logs'

var add = (data) =>
{

  var logTimestamp = (new Date).getTime().toString()
  var logFile = logDir + '/' + logTimestamp + '.txt'

  fsLib.writeFile(logFile, data, (err, data) => {
    if (err) { throw err }
  })
  
}

module.exports = { add }
