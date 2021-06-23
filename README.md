# Timer logs

A minimalist NodeJS library, written in TypeScript, for logging code execution time and errors.

Designed to work well with Google Cloud logging, but useful for any application.

Fully documented with JSDoc(in `.d.ts`) and examples. Includes full typescript support.

## Installation

```cmd
npm install timer-logs
```

## Usage

```typescript
import Timer from 'timer-logs'

const webservice = async () => {
    const timer = new Timer({filename: 'webservice.ts'})
    timer.start('operation 1')
    await sleep(1000) // perform operation 1
    timer.next('operation 2')
    await sleep(2000) // perform operation 2
    timer.next('operation 3')
    await sleep(3000) // perform operation 2
    timer.flush()
}
```

Output:

```json
{
  "severity": "INFO",
  "message": "Timer: 6025ms",
  "filename": "webservice.ts",
  "operation 1": 1010,
  "operation 2": 2000,
  "operation 3": 3014
}
```

## Config options

You can specify more options when constructing the `Timer` object to customise the log output.

```javascript
const timer = new Timer({
    filename: 'webservice.ts',
    label: 'Demo timer',
    details: {id: 'c69adf0e7ff8fddf8a93'},
    severity: 'ERROR'
})
```

```json
{
  "severity": "ERROR",
  "message": "Demo timer: 61ms",
  "filename": "webservice.ts",
  "Demo timer": 61,
  "id": "c69adf0e7ff8fddf8a93"
}
```

## Available methods

The most important function is `timer.flush()` which prints the log to the console. It uses information saved from all
the other function calls including the constructor. This function call should go at the end of the function you are
profiling.

**Other functions**

Start a new timer

```javascript
timer.start('label for timer')
```

Start another timer, after the first one. (Stops the most recently started timer, and begins a new one)

```javascript
timer.next('the next label you want to time')
```

End the most recently started timer. Is automatically called when flush is called if the most recently started timer has
not been ended already.

```javascript
timer.end()
```

To stop a specific timer by name, there are two options

```javascript
const timer1 = timer.start('timer 1')
const timer2 = timer.start('timer 2')
// perform operations
timer.stop('timer 1') // similar to console.time()
timer2.stop() //doesn't require the label
```

### Error logging

Custom error messages

```javascript
timer.customError('Zero length list returned. Expecting at least 1 item')
```

Output:

```json
{
  "severity": "ERROR",
  "message": "Zero length list returned. Expecting at least 1 item",
  "filename": "webservice.ts"
}

```

Postgres error handling

```javascript
const queryResult = await pool.query(`SELECT NOW()`).catch(e => timer.postgresError(e))
```

Generic error handling

```javascript
try {
    JSON.parse('asdfghjkl;')
} catch (e) {
    timer.genericError(e)
}
```

Output

```json
{
  "severity": "ERROR",
  "errorMessage": "Unexpected token a in JSON at position 0",
  "errorName": "SyntaxError",
  "stackTrace": "SyntaxError: Unexpected token a in JSON at position 0\n    at JSON.parse (<anonymous>)\n    at Object.<anonymous> (C:\\Users\\webservice.js:6:10)\n    at Module._compile (node:internal/modules/cjs/loader:1109:14)\n    atObject.Module._extensions..js (node:internal/modules/cjs/loader:1138:10)\n    at Module.load (node:internal/modules/cjs/loader:989:32)\n    at Function.Module._load (node:internal/modules/cjs/loader:829:14)\n    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:76:12)\n    at node:internal/main/run_main_module:17:47",
  "filename": "webservice.ts"
}
```