const heapdump = require('heapdump'),
      http = require('http'),
      // cache = new Map(), // prevent GC of its keys, even there's no reference
      cache = new WeakMap(), // doesn't prevent GC of its keys
      PORT = 3000

function expensiveComputation(user) {
  return `Computed for ${user.id}`
}

function simulateRequest(userId) {
  const userObject = {
    id: userId,
    profile: new Array(1e6).fill(`User-${userId}`)
  }

  if (!cache.has(userObject)) {
    cache.set(userObject, expensiveComputation(userObject))
  }

  return cache.get(userObject)
}

let counter = 0

const server = http.createServer((req, res) => {
  if (req.url === '/compute') {
    simulateRequest(counter++)
    res.end('Request simulated\n')
  } else if (req.url === '/snapshot') {
    const file = `./cache-snap-${Date.now()}.heapsnapshot`
    heapdump.writeSnapshot(file, () => {
      res.end(`Snapshot saved: ${file}`)
    })
  } else {
    res.end('Available routes are:\n-> /compute\n-> /snapshot\n')
  }
})

server.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`))