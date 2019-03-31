// system libs
const IPFS = require('ipfs')
const fsLib = require('fs')
const osLib = require('os')

// internal libs
const configLib = require('./config.js')

// directories
const homeDir = osLib.homedir()
const dataDir = homeDir + '/RemoteX'
const repoDir = dataDir + '/repo'

// build options for IPFS
var options = (repo, init, pubsub, swarm) =>
{

  // default values
  init = init || true // default our init to true, creating new IPFS instance
  pubsub = pubsub || true // default our pubsub to true
  swarm = swarm || ['/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'] // default our swarm address array to ws-star; should be an array if custom swarm

  // build our options
  return { init: init, repo: repo, EXPERIMENTAL: { pubsub: pubsub }, config: { Addresses: { Swarm: swarm } } }

}

// note: always pass a repo here, because this function checks if the repo dir exists or not
var init = () =>
{

  // IPFS repoDir does not exist
  if (!fsLib.existsSync(repoDir))
  {

    // create new IPFS repo
    console.log('Creating new IPFS repo at: ' + repoDir)

    // create repoDir
    fsLib.mkdirSync(repoDir)

    // pass options to options function then start IPFS
    try
    {
      ipfs = new IPFS(options(repoDir))
      id()
    }
    catch (err)
    {
      ipfs.stop()
      configLib.error('trigger')
    }

  }

  // IPFS repoDir exists
  else
  {

    // show IPFS repo
    console.log('Starting IPFS using repo at: ' + repoDir)

    // pass options to options function then start IPFS
    try
    {
      ipfs = new IPFS(options(repoDir, false))
      id()
    }
    catch (err)
    {
      ipfs.stop()
      configLib.error('trigger')
    }

  }

}

// save IPFS id
var id = () =>
{

  // wait for ipfs to be ready
  ipfs.on('ready', () =>
  {

    // id callback
    ipfs.id((err, identity) =>
    {

      // throw err if exist
      if (err) { throw err }

      // save to config file and print to cli
      console.log('\n RemoteX ID: ' + identity.id + '\n')
      console.log(' - Add your RemoteX ID on remote systems to connect to this system')
      console.log(' - Make sure to whitelist said remote systems on this system\n')
      console.log(' From another system:')
      console.log(' remotex connections add ' + identity.id + '\n')
      console.log(' From this system:')
      console.log(' remotex whitelist add <Remote System RemoteX ID>\n')
      configLib.id('update', identity.id)

    })

  })

}

// export functions
module.exports = { init }
