const fs = require('fs'),
      path = require('path'),
      http = require('http'),
      heapdump = require('heapdump'),
      PORT = 3000

const queue = []

function simulateAsyncBuffer(id) {
  const buffer = Buffer.alloc(10 * 1024 * 1024, id * 255)

  // use immediately
  const result = buffer.toString('hex', 0, 16) 
  console.log(`Received buffer ${id}: ${result}`)

  const promise = new Promise((resolve) => {
    setTimeout(() => {
      // console.log(`Processed buffer ${id}`)
      console.log( `Finished processing ${id}`)
      resolve()
    }, 60000)
  })

  queue.push({ id, buffer, promise })
}

let counter = 0

const server = http.createServer((req, res) => {
  if (req.url === '/upload') {
    simulateAsyncBuffer(counter++)
    res.end('Buffer received!\n')
  } else if (req.url === '/snapshot') {
    const file = `./buffer-snap-${Date.now()}.heapsnapshot`
    heapdump.writeSnapshot(file, () => {
      res.end(`Snapshot saved: ${file}`)
    })
  } else {
    res.end('Available routes are:\n-> /upload\n-> /snapshot')
  }
})

server.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`))