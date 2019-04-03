// system libs
const fsLib = require('fs')
const osLib = require('os')
const PubSub = require('ipfs-pubsub-room')
const chalk = require('chalk')
const chokidar = require('chokidar')

// internal libs
const configLib = require('./config.js')
const processLib = require('./process.js')

// directories
const homeDir = osLib.homedir()
const dataDir = homeDir + '/RemoteX'
const execDir = dataDir + '/exec'
const inputDir = dataDir  + '/input'
const outputDir = dataDir + '/output'

// files
const configFile = dataDir + '/config.json'

// declare vars
var connections = {}
var inputWatcher

//*** START NOTES ***//

// Queue File Format
// [ { "connection": "peerId/Qm hash of who to send to", "data": { "type": "hash/command", "arg1": "QmHash/Command", "arg2": "custom folder name or null" } }, ... ]

//*** END NOTES ***//

var init = () =>
{

  // watch process file
  inputWatcher = chokidar.watch(inputDir, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  })

  // check if IPFS started correctly by checking the error flag; there's an error
  if (configLib.error('check'))
  {
    error()
  }

  // no errors so run our init
  else
  {

    // wait for IPFS to be ready
    console.log(`\n ${chalk.gray('---')} RemoteX is loading IPFS...\n`)

    ipfs.on('ready', () => {

      ipfs.id((err, identity) =>
      {

        // throw err if exist
        if (err) { throw err }

        // push id to config file
        configLib.id('update', identity.id)

        // ipfs is completely ready, run everything else...

        // inform cli
        console.log(` ${chalk.gray('---')} RemoteX is ready!`)

        // listen to own channel
        listen()

        // array of peers
        var connections = configLib.connections('list')

        // iterate through peers pubsub channels
        connections.forEach((value, index) =>
        {
          connect(value)
        })

      })

    })
  }

}

//*** connect to peers ***//
var connect = (name) =>
{
  connections[name] = PubSub(ipfs, name)

  // subscribed to peer pubsub channel
  connections[name].on('subscribed', () =>
  {

    // input watcher function
    var inputSender = (path) =>
    {
      // input data
      var inputObject = JSON.parse(fsLib.readFileSync(path))
      var inputBuffer = Buffer.from(JSON.stringify(inputObject["data"]))

      if (inputObject["connection"] == name)
      {
        console.log(`\n ${chalk.blueBright('>>>')} Sending data to:`)
        console.log(`     ${chalk.yellowBright(name)}`)
        console.log('\n')
        console.log('Sent Data:')
        console.dir(inputObject["data"])
        console.log('\n')
        connections[name].sendTo(name, inputBuffer)
        fsLib.unlinkSync(path)
      }
    }

    // process queue file when connection peer joins
    connections[name].on('peer joined', (peer) =>
    {
      if (peer == name)
      {
        console.log(`\n ${chalk.greenBright('!!!')} Connected to:`)
        console.log(`     ${chalk.yellowBright(name)}`)
      }
    })

    // notify when user unavailable
    connections[name].on('peer left', (peer) =>
    {
      if (peer == name)
      {
        console.log(`\n ${chalk.redBright('!!!')} Disconnected from:`)
        console.log(`     ${chalk.yellowBright(name)}`)
      }
    })

    // send when files get added to queue folder
    inputWatcher.on('add', (path) => { inputSender(path) })


  })

}

// listen to own channel
var listen = () =>
{

  // define vars and data
  var id = configLib.id('get')
  var connection = PubSub(ipfs, id)

  // subscribed to own channel success
  connection.on('subscribed', () =>
  {

    // when subscribed to own hash, notify user via cli
    console.log(`\n ${chalk.blueBright('###')} RemoteX daemon listening on:`)
    console.log(`     ${chalk.yellowBright(id)}`)

    // someone joined the channel
    connection.on('peer joined', (peer) =>
    {

      // get whitelist everytime
      let whitelist = configLib.whitelist('list')

      // cli message depending on connection
      if (whitelist.indexOf(peer) >= 0)
      {
        console.log(`\n ${chalk.cyan('###')} Whitelisted connection accepted:`)
        console.log(`     ${chalk.yellowBright(peer)}`)
      }
      else
      {
        console.log(`\n ${chalk.redBright('!!!')} Non-whitelisted connection detected:`)
        console.log(`     ${chalk.yellowBright(peer)}`)
      }

    })

    // someone left the channel
    connection.on('peer left', (peer) =>
    {
      // get whitelist everytime
      let whitelist = configLib.whitelist('list')

      if (whitelist.indexOf(peer) >= 0)
      {
        console.log(`\n ${chalk.cyan('###')} Whitelisted connection disconnected:`)
        console.log(`     ${chalk.yellowBright(peer)}`)
      }
      else
      {
        console.log(`\n ${chalk.redBright('!!!')} Non-whitelisted connection disconnected:`)
        console.log(`     ${chalk.yellowBright(peer)}`)
      }
    })

    // listen for messages in the channel
    connection.on('message', (message) =>
    {

      // get whitelist everytime
      let whitelist = configLib.whitelist('list')

      // peer is on the whitelist, so process the message
      if (whitelist.indexOf(message.from) >= 0)
      {
        console.log(`\n ${chalk.blueBright('<<<')} Receiving data from:`)
        console.log(`     ${chalk.yellowBright(message.from)}`)
        receive(message.from, message.data)
      }

    })

  })

}

// send data to a connection; from connect()
// var send = (inputObject) =>
// {
//
//   // load queue file
//   // FORMAT: [ { "connection": "peerId/Qm hash of who to send to", "data": { "type": "hash/command", "arg1": "QmHash/Command", "arg2": "custom folder name or null" } }, ... ]
//   var processes = JSON.parse(fsLib.readFileSync(queueFile))
//
//   // iterate through queue file, if connection matches then send
//   processes.forEach((process, index) =>
//   {
//     if (process["connection"] == connection)
//     {
//       var dataBuffer = Buffer.from(JSON.stringify(process["data"])) // data is an object that's been stringified already
//       console.log(`\n ${chalk.blueBright('>>>')} Sending data to:`)
//       console.log(`     ${chalk.yellowBright(connection)}`)
//       connections[connection].sendTo(connection, dataBuffer)
//       processes.splice(index, 1)
//       fsLib.writeFileSync(queueFile, JSON.stringify(processes))
//     }
//   })
//
// }

// receive data; from listen()
var receive = (connection, data) =>
{

  // data from
  var peer = connection

  // data parts
  var data = JSON.parse(data)
  console.log('\n')
  console.log('Received Data:')
  console.dir(data)
  console.log('\n')
  var type = data["type"] // 'hash' or 'command' or 'output'
  var query = data["query"] // QmHash or Command or output
  var timestamp = data["timestamp"]

  // run query if it's not an output
  if (type !== 'output')
  {
    // run the query
    // send output back to peer/connection with the type set as "output"
    processLib.queue("output", "I received it and processed it!", [peer])
  }
  // else, save to output folder
  else
  {

  }

}

// log error in cli
var error = () =>
{
  throw "RemoteX halted!"
  // error message
  console.log(chalk.redBright('Error flag was triggered! Connections and listener halted. Please check logs and restart RemoteX.'))

}

module.exports = { init }
