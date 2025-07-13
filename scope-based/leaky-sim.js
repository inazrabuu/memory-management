const heapdump = require('heapdump'),
      http = require('http'),
      leakyMap = new Map(),
      PORT = 3000

let counter = 0

function leakMemory(id) {
  const largeArray = new Array(1e6).fill('$')
  leakyMap.set(id, largeArray)

  //FIX: Auto clean after 5 seconds
  setTimeout(() => {
    leakyMap.delete(id)
    console.log(`${id} cleared!`)
  }, 5000)
}

let intervals = []

function startLeakyInterval(id) {
  const largeArray = new Array(1e6).fill('^')

  const interval = setInterval(() => {
    const sample = largeArray[0]
    if (id % 100 === 0) console.log(`Interval ${id} still alive`)

    // FIX: clear the interval
    if (Date.now() % 5 === 0) {
      clearInterval(interval)
      console.log(`Interval ${id} cleared`)
    }
  }, 1000)

  intervals.push(interval)
}

const server = http.createServer((req, res) => {
  if (req.url === '/leak') {
    // leakMemory(counter++)
    startLeakyInterval(counter++)
    res.end('/leak is called\n')
  } else if (req.url === '/snapshot') {
    const file = `./snap-${Date.now()}.heapsnapshot`
    heapdump.writeSnapshot(file, (err, filename) => {
      res.end(`Snapshot saved to ${filename}`)
    })
  } else {
    res.end('available routes are /leak & /snapshot')
  }
})

server.listen(PORT, () => {
  console.log(`Server is listening to port ${PORT}`)
})