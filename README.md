# Memory Management

A repository that can serves as a guide to understanding memory management in JavaScript / Node.js—from garbage collection fundamentals to advanced debugging techniques. Whether you're battling memory leaks, optimizing V8 engine performance, or mastering WeakMap and WeakRef, these practical examples will help you write faster, leaner, and more reliable code.

## Why This Repo?

Memory issues in JavaScript / Node.js can be silent killers—draining performance, crashing servers, and causing unpredictable behavior.

## Setup Guide
- clone the repo
- `npm install`
- go to each directory and `node --inspect <filename>.js`

## Memory Leak Summary

1. **setInterval Never Cleared**

### Problem
- setInterval() retains a closure that holds a large object ( Array, Buffer, etc)
- Never calling clearInterval() -> memory grows over time

### Symptoms
- Repeating timers that never stop
- Retained closures in heap snapshots
- Increasing retained heap size per interval

### Fix
- Use clearInterval() affter a timeout or condition
- Or use setTimeout() if no repeating is needed

```
const interval = setInterval(() => {
  // logic
}, 1000);

setTimeout(() => clearInterval(interval), 10000);
```