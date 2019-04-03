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
const inputDir = dataDir  + '/input'
const outputDir = dataDir + '/output'

// files
const configFile = dataDir + '/config.json'

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

  // create inputDir if it doesnt exist
  if (!fsLib.existsSync(inputDir))
  {
    fsLib.mkdirSync(inputDir)
  }

  // create outputDir if it doesnt exist
  if (!fsLib.existsSync(outputDir))
  {
    fsLib.mkdirSync(outputDir)
  }

  // create queue file if it doesnt exist, and inject empty array inside it
  // if (!fsLib.existsSync(queueFile))
  // {
  //   fsLib.writeFileSync(queueFile, JSON.stringify( [] ))
  //   console.log(` ${chalk.magenta('+++')} Created new queue file.`)
  // }
  // // else
  // // {
  // //   console.log(` ${chalk.magenta('===')} Loaded existing queue file.`)
  // // }
  //
  // // create output file if it doesnt exist, and inject empty array inside it
  // if (!fsLib.existsSync(outputFile))
  // {
  //   fsLib.writeFileSync(outputFile, JSON.stringify( [] ))
  //   console.log(` ${chalk.magenta('+++')} Created new output file.`)
  // }
  // else
  // {
  //   console.log(` ${chalk.magenta('===')} Loaded existing output file.`)
  // }

  // config file exists
  if (fsLib.existsSync(configFile))
  {

    // load file to session global var
    session = JSON.parse(fsLib.readFileSync(configFile))

    // clear error, because init
    error('clear')

    // log and return
    console.log(` ${chalk.gray('---')} RemoteX is loading existing config file...`)
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
    console.log(` ${chalk.gray('---')} RemoteX is creating new config file...`)
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
          console.log(`\n ${chalk.redBright('!!!')} Already on the whitelist:`)
          console.log(`     ${chalk.yellowBright(peer)}\n`)
        }
        else
        {
          let peerDir = filesDir + '/' + peer
          if (!fsLib.existsSync(peerDir))
          {
            fsLib.mkdirSync(peerDir)
          }
          session['whitelist'].push(peer)
          console.log(`\n ${chalk.greenBright('!!!')} Added to the whitelist:`)
          console.log(`     ${chalk.yellowBright(peer)}\n`)
          save()
        }
      }
      else
      {
        console.log(`\n ${chalk.redBright('!!!')} Invalid peer argument!\n`)
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
          console.log(`\n ${chalk.greenBright('!!!')} Removed from the whitelist:`)
          console.log(`     ${chalk.yellowBright(peer)}\n`)
          save()
        }
        else
        {
          console.log(`\n ${chalk.redBright('!!!')} Not on the whitelist:`)
          console.log(`     ${chalk.yellowBright(peer)}\n`)
        }
      }
      else
      {
        console.log(`\n ${chalk.redBright('!!!')} Invalid peer argument!\n`)
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
          console.log(`\n ${chalk.redBright('!!!')} Already on the connections list:`)
          console.log(`     ${chalk.yellowBright(peer)}\n`)
        }
        else
        {
          session['connections'].push(peer)
          console.log(`\n ${chalk.greenBright('!!!')} Added to the connections list:`)
          console.log(`     ${chalk.yellowBright(peer)}\n`)
          save()
        }
      }
      else
      {
        console.log(`\n ${chalk.redBright('!!!')} Invalid peer argument!\n`)
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
          console.log(`\n ${chalk.greenBright('!!!')} Removed from the connections list:`)
          console.log(`     ${chalk.yellowBright(peer)}\n`)
          save()
        }
        else
        {
          console.log(`\n ${chalk.redBright('!!!')} Not on the connections list:`)
          console.log(`     ${chalk.yellowBright(peer)}\n`)
        }
      }
      else
      {
        console.log(`\n ${chalk.redBright('!!!')} Invalid peer argument!\n`)
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
