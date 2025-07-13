const EventEmitter = require('events'),
      heapdump = require('heapdump'),
      http = require('http'),
      PORT = 3000

class ChatRoom extends EventEmitter {}

const room = new ChatRoom()
let users = []

function simulateUserJoin(id) {
  const userData = new Array(1e6).fill(`User-${id}`)

  function onMessage(msg) {
    if (id % 50 === 0) console.log(`User ${id} got message: ${msg}`)
  }

  room.on('message', onMessage)

  // FIX: simulate user leave after 5 seconds
  setTimeout(() => {
    room.removeListener('message', onMessage)
    console.log(`User ${id} left.`)
  }, 5000)

  users.push({
    id, 
    userData,
    onMessage
  })
}

let counter = 0

const server = http.createServer((req, res) => {
  if (req.url === '/join') {
    simulateUserJoin(counter++)
    res.end(`User ${counter} has joined.\n`)
  } else if (req.url === '/broadcast') {
    room.emit('message', `Hello at ${Date.now()}`)
    res.end('Broadcast sent!\n')
  } else if (req.url === '/snapshot') {
    const file = `./emitter-snap-${Date.now()}.heapsnapshot`
    heapdump.writeSnapshot(file, (err, file) => {
      res.end(`Snapshot save: ${file}`)
    })
  } else {
    res.end('available routes are: \n/join \n/broadcast \n/snapshot\n')
  }
})

server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))