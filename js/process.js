// system libs
const fsLib = require('fs')
const osLib = require('os')
const chalk = require('chalk')
const chokidar = require('chokidar')
const detect = require('language-detect')

// internal libs
const configLib = require('./config.js')

// directories
const homeDir = osLib.homedir()
const dataDir = homeDir + '/RemoteX'
const execDir = dataDir + '/exec'
const logDir = dataDir + '/logs'
const filesDir = dataDir + '/files'

// files
const configFile = dataDir + '/config.json'
const queueFile = dataDir + '/queue.json'

// receive Qm hash of something >
// ipfs cat it >
// payload of a script or whatever >
// with indicator of either type command or output >
// process it >
// ipfs hash it >
// send hash

var init = () =>
{

}


var processHash = (peer, hash, folder) =>
{

  // 3. if applicable, read queue file, then write data to queue file

  folder = folder || hash // check if folder is null, if it is, then create a folder using the hash as the name

  // get the files from ipfs, iterate through folder and files
  let stream = ipfs.getReadableStream(hash)
  stream.on('data', (file) => {

    // if adding just a file, put it in a folder first so we can get the filename
    // regardless of whether a folder is added or not (on root), change the root folder to a generated folder
    // recursively add everything else to generated folder

    if(file.type !== 'dir') {
      file.content.on('data', (data) => {

        let fileNameArray = file.path.split('/')
        let fileFolder = fileNameArray[0]
        let fileName = fileNameArray[1]

        console.log(`this is a file: ${fileName}`)

      })
      file.content.resume()
    } else {
      console.log(`this is a folder: ${file.path}`)
    }

  })


  // ipfs.get(hash, function (err, files) {
  //
  //   files.forEach((file) => {
  //
  //     // ipfs data
  //     console.log(`\n ${chalk.magentaBright('***')} Processed data for:`)
  //     console.log(`     ${chalk.yellowBright(peer)}`)
  //
  //     // save data to peer folder
  //     let filePath = filesDir + '/' + peer + '/' + file.path
  //
  //     // file doesnt exist
  //     if (!fsLib.existsSync(filePath))
  //     {
  //       console.log(`\n     ${chalk.bold('Saved to file:')}`)
  //       console.log(`     ${filePath}`)
  //       fsLib.writeFileSync(filePath, file.content.toString('utf8'))
  //     }
  //     else
  //     {
  //       console.log(`\n     ${chalk.bold('File already exists!')}`)
  //       console.log(`     ${filePath}`)
  //     }
  //
  //     // remove from our array when everything is done
  //     processes.splice(index, 1)
  //     fsLib.writeFileSync(receiveProcessFile, JSON.stringify(processes))
  //
  //   })
  //
  // })
}

var processCommand = (peer, command, arguments) =>
{

  // // arbitrary data (string)
  // console.log(`\n ${chalk.magentaBright('***')} Processed data for:`)
  // console.log(`     ${chalk.yellowBright(process["connection"])}`)
  // console.log(`     ${chalk.bold(process["data"])}`)

}

// CLIENT SIDE
// store in queue file
// type: 'hash' or 'command'
// arg1: QmHash or Command
// arg2:
var queue = (type, arg1, arg2) =>
{

}

// remotex run <peer> <command in quotes> // this is not a Qm hash in init()
// remotex push <peer> <files> <folder to store in remotely> // Qm hash in init()
// remotex pull <peer> <files> <folder to store in locally> // Qm hash in init()
// remotex cli <peer> // same as run but we get output in return; not a Qm hash in init()

// var run = () =>
// {}
//
// var push = () =>
// {}
//
// var pull = () =>
// {}
//
// var cli = () =>
// {}

// export functions
module.exports =
{
  init,
  processHash, processCommand,
  queue
 }
