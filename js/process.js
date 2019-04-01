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

// flow of data from client:

// send a qm hash:
// send qm hash > relay sees the queue changes > processHash > sends

// send a command:

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

var processCommand = (peer, input) =>
{

  // // arbitrary data (string)
  // console.log(`\n ${chalk.magentaBright('***')} Processed data for:`)
  // console.log(`     ${chalk.yellowBright(process["connection"])}`)
  // console.log(`     ${chalk.bold(process["data"])}`)

}

var processOutput = (peer, output) =>
{

}

// CLIENT SIDE
// store in queue file
// type: 'hash' or 'command' or 'output'
// arg1: QmHash or Command
// arg2:

// for example:
// npm run remotex process "git clone git@github.com:jenselg/remotex.git" QmNj9zZM9J9hwNqKV9s6rLSmsgPSqjSqb6U11q6hXmZ5BR

var queue = (type, query, peers) =>
{
  peers.forEach((peer, index) =>
  {

    var queueObject = {}
    queueObject["connection"] = peer
    queueObject["data"] = {}
    queueObject["data"]["type"] = type
    queueObject["data"]["query"] = query
    console.dir(JSON.parse(queueObject))

    var processes = JSON.parse(fsLib.readFileSync(queueFile))
    processes.push(queueObject)
    fsLib.writeFileSync(queueFile, JSON.stringify(processes))

  })
}

// export functions
module.exports =
{
  processHash, processCommand, processOutput,
  queue
 }
