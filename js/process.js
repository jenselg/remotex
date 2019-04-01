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
const receiveProcessFile = dataDir + '/receive-process.json'
const sendProcessFile = dataDir + '/send-process.json'

// receive Qm hash of something >
// ipfs cat it >
// payload of a script or whatever >
// with indicator of either type command or output >
// process it >
// ipfs hash it >
// send hash

var init = () =>
{

  // vars
  var receiveWatcher

  // watch process file
  receiveWatcher = chokidar.watch(receiveProcessFile, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  })

  var execute = () =>
  {
    var processes = JSON.parse(fsLib.readFileSync(receiveProcessFile))

    processes.forEach((process, index) => {

        // received a Qm hash, so this is a push
        if (process['data'].substring(0, 2) == 'Qm')
        {

          let hash = process["data"]
          let peer = process["connection"]
          let folder = process["folder"]

          let get = (hash, peer, folder) =>
          {

            // CREATE ROOT FOLDER HERE

            // START IFPS GET
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

                  //console.log(data.toString())

                })
                file.content.resume()
              } else {
                console.log(`this is a folder: ${file.path}`)
              }

            })
            // END IPFS GET

            processes.splice(index, 1)
            fsLib.writeFileSync(receiveProcessFile, JSON.stringify(processes))

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

          // valid data
          if (hash && peer && folder)
          {
            get(hash, peer, folder)
          }
          // invalid data
          else
          {
            processes.splice(index, 1)
            fsLib.writeFileSync(receiveProcessFile, JSON.stringify(processes))
          }

        }
        // string command
        else
        {

          // arbitrary data (string)
          console.log(`\n ${chalk.magentaBright('***')} Processed data for:`)
          console.log(`     ${chalk.yellowBright(process["connection"])}`)
          console.log(`     ${chalk.bold(process["data"])}`)

          // remove from our array
          processes.splice(index, 1)
          fsLib.writeFileSync(receiveProcessFile, JSON.stringify(processes))

        }

    })

  }

  // received something
  receiveWatcher.on('ready', () => { execute() })

  // received something
  receiveWatcher.on('change', () => { execute() })

  // received something
  receiveWatcher.on('raw', () => { execute() })

}

// CLIENT SIDE
// store in send process

// remotex run <peer> <command in quotes> // this is not a Qm hash in init()
// remotex push <peer> <files> <folder to store in remotely> // Qm hash in init()
// remotex pull <peer> <files> <folder to store in locally> // Qm hash in init()
// remotex cli <peer> // same as run but we get output in return; not a Qm hash in init()

var run = () =>
{}

var push = () =>
{}

var pull = () =>
{}

var cli = () =>
{}

// export functions
module.exports = { init, run, push, pull, cli }
