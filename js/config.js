// system libs
const fsLib = require('fs')
const osLib = require('os')

// directories
const homeDir = osLib.homedir()
const dataDir = homeDir + '/RemoteX'

// app config file
const configFile = dataDir + '/config.json'

// init
var init = () =>
{

  // dataDir doesnt exist so create it
  if (!fsLib.existsSync(dataDir))
  {

    // create dataDir
    fsLib.mkdirSync(dataDir)

  }

  // config file exists
  if (fsLib.existsSync(configFile))
  {

    // load file to session global var
    session = JSON.parse(fsLib.readFileSync(configFile))

    // clear error, because init
    error('clear')

    // log and return
    console.log('Loaded existing config file!')
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
    console.log('Created new config file!')
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

// whitelisting peers that are allowed to query
// peer should be array for adding: [peerid, friendlyname]
// peer should be Qm hash for removing
var whitelist = (command, peer) =>
{

  // command options
  switch (command)
  {

    // resolve friendly name, return Qm hash, if it exists in the config file
    case 'resolve':
      // provided peer argument is a Qm hash
      if (peer.substring(0, 2) == 'Qm')
      {
      }
      // provided peer argument is a friendly name
      else
      {
      }
    break

    // add peer allowed to communicate
    case 'add':
      session['whitelist'].push(peer)
      save()
    break

    // remove peer from allowed
    case 'remove':
      session['whitelist'] = session['whitelist'].filter(i => i[0] !== peer)
      save()
    break

    // list all peers that are allowed to communicate
    case 'list':
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

  // command options
  switch (command)
  {

    // resolve friendly name, returns Qm hash, if it exists in the config file
    case 'resolve':
      // provided peer argument is a Qm hash
      if (peer.substring(0, 2) == 'Qm')
      {
      }
      // provided peer argument is a friendly name
      else
      {
      }
    break

    // add peer to connect to
    case 'add':
      session['connections'].push(peer)
      save()
    break

    // remove peer to connect to
    case 'remove':
      session['connections'] = session['connections'].filter(i => i[0] !== peer)
      save()
    break

    // list peers that the app is connecting to
    case 'list':
      return session['connections']
    break

    default:
      // do nothing

  }

}

// ipfs id
var id = (id) =>
{
  session['id'] = id
  save()


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
