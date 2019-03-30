// system libs
const PubSub = require('ipfs-pubsub-room')

// internal libs
const configLib = require('./config.js')

// init function
var init = () =>
{

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

      // listen to own channel
      listen()

      // array of peers
      var connections = configLib.connections('list')

      // iterate through peers pubsub channels
      connections.forEach((value, index) =>
      {

        // call listen function and pass channel name
        // value[0] is Qm hash, since value[1] is friendly name
        connect(value[0])

      })

    })

  }

}

// connect to peers pubsub channels
var connect = (name) =>
{

  let connection = PubSub(ipfs, name)

  // subscribed to peer pubsub channel
  connection.on('subscribed', () =>
  {

    // send to peer when an event happens
    // connection.sendTo(name, 'Hello ' + peer + '!'))

    // received reply
    connection.on('message', (message) =>
    {

      // if came from peer else, ignore it
      if (message.from == name)
      {

        // if accepted we expect a return value, if not, there's nothing
        // do something about it
        // console.log(name + ': ' + 'got message from ' + message.from + ': ' + message.data.toString()))

      }

    })

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

    console.log(`Listening: ${id}`)

    // listen for messages
    connection.on('message', (message) =>
    {

      // get whitelist everytime
      let whitelist = configLib.whitelist('list')

      // peer is on the whitelist, so process the message
      if (whitelist.indexOf(message.from) >= 0)
      {
         console.log(id + ': ' + 'got message from ' + message.from + ': ' + message.data.toString())
      }

    })

  })

}

// log error in cli
var error = () =>
{

  // error message
  console.log('Error flag was triggered! Connections and listener halted. Please check logs and restart RemoteX.')

}

module.exports =
{
  init
}
