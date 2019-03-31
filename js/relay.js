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

// files
const configFile = dataDir + '/config.json'
const receiveProcessFile = dataDir + '/receive-process.json'
const sendProcessFile = dataDir + '/send-process.json'

// watcher.on('change', path => console.log(`File ${path} has been changed`))
// process format: { connection: <QmHash>, data: <stream/command> }

// declare vars
var connections = {}
var receiveWatcher
var sendWatcher

// init functions
//
// var receiveWatchInit = () =>
// {
//   // watch process file
//   receiveWatcher = chokidar.watch(receiveProcessFile, {
//     ignored: /(^|[\/\\])\../,
//     persistent: true
//   })
//   return receiveWatcher
// }
//
// var sendWatchInit = () =>
// {
//   // watch process file
//   sendWatcher = chokidar.watch(sendProcessFile, {
//     ignored: /(^|[\/\\])\../,
//     persistent: true
//   })
//   return sendWatcher
// }

var init = () =>
{

  // watch process file
  receiveWatcher = chokidar.watch(receiveProcessFile, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  })

  // watch process file
  sendWatcher = chokidar.watch(sendProcessFile, {
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
    ipfs.on('ready', () => {

      processLib.init()

      // // watch init
      // receiveWatchInit()
      // sendWatchInit()

      // listen to own channel
      listen()

      // array of peers
      var connections = configLib.connections('list')

      // iterate through peers pubsub channels
      connections.forEach((value, index) =>
      {

        // call listen function and pass channel name
        // value[0] is Qm hash, since value[1] is friendly name
        connect(value)

      })

    })

  }

}

// connect to peers pubsub channels
var connect = (name) =>
{
  connections[name] = PubSub(ipfs, name)

  // subscribed to peer pubsub channel
  connections[name].on('subscribed', () =>
  {

    // send when connection peer joins
    connections[name].on('peer joined', (peer) =>
    {
      if (peer == name)
      {
        console.log(`\n ${chalk.greenBright('!!!')} Connected to:`)
        console.log(`     ${chalk.yellowBright(name)}`)
        send(name)
      }
    })

    // send when send file changes
    sendWatcher.on('change', () => {
      if (connections[name].hasPeer(name))
      {
        send(name)
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

    //sendWatcher.on('change', send(name))

    // received reply
    // connections[name].on('message', (message) =>
    // {
    //
    //   // if came from peer else, ignore it
    //   if (message.from == name)
    //   {
    //
    //     // if accepted we expect a return value, if not, there's nothing
    //     // do something about it
    //     // console.log(name + ': ' + 'got message from ' + message.from + ': ' + message.data.toString()))
    //
    //   }
    //
    // })

  })

}

// listen on own channel
var listen = () =>
{

  // define vars and data
  let id = configLib.id('get')
  let connection = PubSub(ipfs, id)

  // subscribed to own channel success
  connection.on('subscribed', () =>
  {

    console.log(` - Listening on: ${id}`)

    connection.on('peer joined', (peer) =>
    {
      // get whitelist everytime
      let whitelist = configLib.whitelist('list')

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

    // listen for messages
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

// monitor processFile variable through chokidar
// process format: { connection: <QmHash>, data: <stream/command> }

// send data to a connection
var send = (connection) =>
{
  // load send process file
  var processes = JSON.parse(fsLib.readFileSync(sendProcessFile))

  // iterate through process file, if connection matches then send
  processes.forEach((process, index) => {
    if (process['connection'] == connection)
    {
      var dataBuffer = Buffer.from(process['data'])
      console.log(`\n ${chalk.blueBright('>>>')} Sending data to:`)
      console.log(`     ${chalk.yellowBright(connection)}`)
      connections[connection].sendTo(connection, dataBuffer)
      processes.splice(index, 1)
      fsLib.writeFileSync(sendProcessFile, JSON.stringify(processes))
    }
    // else
    // {
    //   console.log(`\n !!! Invalid process entry detected. Please see the following data:\n`)
    //   console.dir(process)
    // }
  })

}

var receive = (connection, data) =>
{
  data = data.toString()
  var dataObject = {}
  dataObject['timestamp'] = (new Date).getTime()
  dataObject['connection'] = connection
  dataObject['data'] = data

  var processes = JSON.parse(fsLib.readFileSync(receiveProcessFile))
  processes.push(dataObject)
  fsLib.writeFileSync(receiveProcessFile, JSON.stringify(processes))
}

// log error in cli
var error = () =>
{

  // error message
  console.log(chalk.redBright('Error flag was triggered! Connections and listener halted. Please check logs and restart RemoteX.'))

}

//////////////// LISTENER //////////////////////

// monitor for commands from run using chokidar on a json file
// sendWatcher.on('change', (path) => {
//   var processes = JSON.parse(fsLib.readFileSync(sendProcessFile))
//   processes.forEach((process, index) => {
//     connections[name].sendTo(name, process['index'])
//   })
// })

module.exports =
{
  init
}
