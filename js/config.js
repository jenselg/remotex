// system libs
const fsLib = require('fs')
const osLib = require('os')
const chalk = require('chalk')

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

// init
var init = () =>
{

  // create dataDir if it doesnt exist
  if (!fsLib.existsSync(dataDir))
  {
    fsLib.mkdirSync(dataDir)
  }

  // create execDir if it doesnt exist
  if (!fsLib.existsSync(execDir))
  {
    fsLib.mkdirSync(execDir)
  }

  // create logDir if it doesnt exist
  if (!fsLib.existsSync(logDir))
  {
    fsLib.mkdirSync(logDir)
  }

  // create filesDir if it doesnt exist
  if (!fsLib.existsSync(filesDir))
  {
    fsLib.mkdirSync(filesDir)
  }

  // create process file if it doesnt exist, and inject empty array inside it
  if (!fsLib.existsSync(receiveProcessFile))
  {
    fsLib.writeFileSync(receiveProcessFile, JSON.stringify( [] ))
    console.log(' - Created new receive process file!')
  }
  else
  {
    console.log(' - Loaded existing receive process file!')
  }

  // create process file if it doesnt exist, and inject empty array inside it
  if (!fsLib.existsSync(sendProcessFile))
  {
    fsLib.writeFileSync(sendProcessFile, JSON.stringify( [] ))
    console.log(' - Created new send process file!')
  }
  else
  {
    console.log(' - Loaded existing send process file!')
  }

  // config file exists
  if (fsLib.existsSync(configFile))
  {

    // load file to session global var
    session = JSON.parse(fsLib.readFileSync(configFile))

    // clear error, because init
    error('clear')

    // log and return
    console.log(' - Loaded existing config file!\n')
    return session

  }

  // config file doesnt exist
  else
  {

    // init global var then write to file
    session = {}
    session['id'] = ''
    session['whitelist'] = []
    session['connections'] = []
    session['error'] = false
    fsLib.writeFileSync(configFile, JSON.stringify(session))

    // log and return
    console.log(' - Created new config file!\n')
    return session

  }

}

// save to config file
var save = () =>
{

  // write session var to config file
  fsLib.writeFileSync(configFile, JSON.stringify(session))

}

// reset config file
var reset = () =>
{

  // reset global var then write to file
  session = {}
  session['id'] = ''
  session['whitelist'] = []
  session['connections'] = []
  session['error'] = false
  fsLib.writeFileSync(configFile, JSON.stringify(session))

  // log and return
  console.log('Reset config file!')
  return session

}

// read config to session
var read = () =>
{
  session = JSON.parse(fsLib.readFileSync(configFile))
}

// whitelisting peers that are allowed to query
// peer should be array for adding: [peerid, friendlyname]
// peer should be Qm hash for removing
var whitelist = (command, peer) =>
{

  // force peer value to string
  if (peer)
  {
    peer = peer.toString()
  }

  // command options
  switch (command)
  {

    // add peer allowed to communicate
    case 'add':
      if (peer !== undefined && peer.substring(0,2) == 'Qm')
      {
        read()
        if (session['whitelist'].indexOf(peer) >= 0)
        {
          console.log('\n' + chalk.yellowBright(peer) + ' ' + chalk.redBright('is already on the whitelist!') + '\n')
        }
        else
        {
          let peerDir = filesDir + '/' + peer
          if (!fsLib.existsSync(peerDir))
          {
            fsLib.mkdirSync(peerDir)
          }
          session['whitelist'].push(peer)
          console.log('\n' + chalk.greenBright('Added') + ' ' + chalk.yellowBright(peer) + ' ' + chalk.greenBright('to the whitelist!') + '\n')
          save()
        }
      }
      else
      {
        console.log(chalk.redBright('\nInvalid peer argument!\n'))
      }
    break

    // remove peer from allowed
    case 'remove':
      if (peer !== undefined && peer.substring(0,2) == 'Qm')
      {
        read()
        if (session['whitelist'].indexOf(peer) >= 0)
        {
          session['whitelist'] = session['whitelist'].filter(i => i !== peer)
          console.log('\n' + chalk.greenBright('Removed') + ' ' + chalk.yellowBright(peer) + ' ' + chalk.greenBright('from the whitelist!') + '\n')
          save()
        }
        else
        {
          console.log('\n' + chalk.yellowBright(peer) + ' ' + chalk.redBright('is not on the whitelist!') + '\n')
        }
      }
      else
      {
        console.log(chalk.redBright('\nInvalid peer argument!\n'))
      }
    break

    // list all peers that are allowed to communicate
    case 'list':
      read()
      return session['whitelist']
    break

    default:
      // do nothing

  }

}

// connecting to peer channels by subscribing to pubsub channels under their own ID's
// peer should be array for adding: [peerid, friendlyname]
// peer should be Qm hash for removing
var connections = (command, peer) =>
{

  // force peer value to string
  if (peer)
  {
    peer = peer.toString()
  }

  // command options
  switch (command)
  {

    // add connection
    case 'add':
      if (peer !== undefined && peer.substring(0,2) == 'Qm')
      {
        read()
        if (session['connections'].indexOf(peer) >= 0)
        {
          console.log('\n' + chalk.yellowBright(peer) + ' ' + chalk.redBright('is already on the connections list!') + '\n')
        }
        else
        {
          session['connections'].push(peer)
          console.log('\n' + chalk.greenBright('Added') + ' ' + chalk.yellowBright(peer) + ' ' + chalk.greenBright('to the connections list!') + '\n')
          save()
        }
      }
      else
      {
        console.log(chalk.redBright('\nInvalid peer argument!\n'))
      }
    break

    // remove connection
    case 'remove':
      if (peer !== undefined && peer.substring(0,2) == 'Qm')
      {
        read()
        if (session['connections'].indexOf(peer) >= 0)
        {
          session['connections'] = session['connections'].filter(i => i !== peer)
          console.log('\n' + chalk.greenBright('Removed') + ' ' + chalk.yellowBright(peer) + ' ' + chalk.greenBright('from the connections list!') + '\n')
          save()
        }
        else
        {
          console.log('\n' + chalk.yellowBright(peer) + ' ' + chalk.redBright('is not on the connections list!') + '\n')
        }
      }
      else
      {
        console.log(chalk.redBright('\nInvalid peer argument!\n'))
      }
    break

    // list all peers that are allowed to communicate
    case 'list':
      read()
      return session['connections']
    break

    default:
      // do nothing

  }

}

// // ipfs id
// var id = (id) =>
// {
//   session['id'] = id
//   save()
// }

// save IPFS id
var id = (command, id) =>
{

  switch(command)
  {

    // return id
    case 'get':
      return session['id']
    break

    // update id
    case 'update':
      session['id'] = id
      save()
    break

    default:
      // do nothing

  }

}


// error handling
var error = (command) =>
{

  // command options
  switch (command)
  {

    // check if there's an error
    case 'check':
      // error occurred
      if (session['error'])
      {
        return true
      }

      // error did not occur
      else
      {
        return false
      }
    break

    // trigger the error flag in session
    case 'trigger':
      console.log('Error flag triggered!')
      session['error'] = true
      save()
    break

    // clear the error flag
    case 'clear':
      session['error'] = false
      save()
    break

    default:
      // do nothing

  }

}

// export functions
module.exports =
{
  init, save, reset, whitelist, connections, id, error
}
