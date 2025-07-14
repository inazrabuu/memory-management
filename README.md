# Memory Management

A repository that can serves as a guide to understanding memory management in JavaScript / Node.js—from garbage collection fundamentals to advanced debugging techniques. Whether you're battling memory leaks, optimizing V8 engine performance, or mastering WeakMap and WeakRef, these practical examples will help you write faster, leaner, and more reliable code.

## Why This Repo?

Memory issues in JavaScript / Node.js can be silent killers, draining performance, crashing servers, and causing unpredictable behavior.

## Setup Guide
- clone the repo
- `npm install`
- go to each directory and `node --inspect <filename>.js`

## Memory Leak Summary

### 1. **setInterval Never Cleared**

#### Problem
- `setInterval()` retains a closure that holds a large object ( Array, Buffer, etc)
- Never calling `clearInterval()` -> memory grows over time

#### Symptoms
- Repeating timers that never stop
- Retained closures in heap snapshots
- Increasing retained heap size per interval

#### Fix
- Use `clearInterval()` affter a timeout or condition
- Or use `setTimeout()` if no repeating is needed

```node
const interval = setInterval(() => {
  // logic
}, 1000)

setTimeout(() => clearInterval(interval), 10000)
```

### 2. EventEmitter Listeners Never Removed

#### Problem
- Adding listeners (emitter.on) but never removing them
- Each listener closure holds onto user-specific data
- Causes memory growth and may trigger `MaxListenersExceededWarning`

#### Symptoms
- Increasing number of closures
- Retained memory in `EventEmitter._events`
- Listeners reference large objects via closure

#### Fix
- Always remove listeners using `removeListeners()` or `off()`
- Or use `once() ` for one-time events

```node
const onMessage = (msg) => { ... }
emitter.on('event', onMessage)

// Cleanup
emitter.removeListener('event', onMessage);
```

### 3. Cache with Strong Reference in `Map`

#### Problem
- Storing ephemereal object keys in a `Map` (e.g `Map<user, result>`)
- JS `Map` holds strong references -> keys & values never GC'd

#### Symptoms
- Growing cache size
- `Map` retains user/request objects and their inner data
- Heap snapshot shows chain: `Map -> Key -> Object -> Large Data`

#### Fix
- Use `WeakMap` for object keys you don't want to retain forever

```node
const cache = new WeakMap()

function getCached(obj) {
  if (!cache.has(obj)) {
    cache.set(obj, compute(obj))
  }

  return cache.get(obj)
}
```

### 4. Async Callback Retaining Large Buffers

#### Problem
- Large buffers or objects are passed into async closures
- Promises stay pending -> closure (and buffers) not collected
- Stored in queue or unresolved task list

#### Symptoms
- Snapshot shows Buffers held by closure inside pending Promise
- Growing number of `Buffers` or `ArrayBuffer` instances

#### Fix
- Avoid holding large data in async closures unless needed
- Extract relevant into first, then release the reference

```node
const buffer = Buffer.alloc(10_000_000) //10Mb
const hash = buffer.toString('hex', 0, 0)

setTimeout(() => {
  console.log(`Done with ${hash})
}, 60000)
```

### Useful Tools
| Tool | use | 
|------|-----|
| `heapdump` | Trigger & save `.heapdump` |
| ChromeDevTools | Load snapshots, inspect memory |
| 'Retainers' view | Trace GC path of retained objects |
| `--inspect` flag | Enable remote debugging |
| CLI tools like `curl` | Simulate repeated triggers |

### General Fix Patterns
| Leak Type | Fix | 
|------|-----|
| Unstopped intervals | `clearInterval()` |
| Long-lived listeners | `removeListener()` or `once()` |
| Growing cache | Use `WeakMap` or TTL logic |
| Aync closures with large data | Decouple or nullify references only |

### Warning Signs
- Snapshots size increases linearly with usage
- Increasing count of similar object types (`Array`, `Buffer`, `Closure`)
- 'Retainers' show unexpected GC roots (e.g., `Map`, `EventEmitter`, global)