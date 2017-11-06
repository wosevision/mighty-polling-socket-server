# Mighty Polling ⚡️ Socket Server

A batteries included long-polling proxy microservice, built on Node/Express and Websockets with RxJS.

Built for situations when:

- you have datasource[s] you need to poll using HTTP for realtime results
- polling on the client side would represent too many HTTP requests / too heavy parsing / some other performance nag
- you'd like clients to instead be able to subscribe to a fed source at a given endpoint and receive *only changed data*

## Code Example

Show me the code!

```js
const { PollingSocketServer } = require('mighty-polling-socket-server');

// optionally BYOE: "bring your own Express"!
const express = require('express');
const expressApp = express();
expressApp.use(express.static('/somepath'));

const sources = [{
  type: 'weather',
  url: 'http://someother.api.com/v4/weather.json',
  compare: (oldData, newData) => oldData.time === newData.time,
  transform: data => `It was ${data.degrees.celsius}°C at ${data.time}`
}, {
  type: 'emergency',
  path: 'emergencies',
  url: 'http://some.api.com/v2/emergency_rss.xml',
  compare: (
    { rss: { channel: [{ pubDate: [oldData] }] } },
    { rss: { channel: [{ pubDate: [newData] }] } }
  ) => oldData === newData,
  interval: 60000,
  xml: true
}];

const pss = new PollingSocketServer({
  defaultInterval: 1000,
  logging: false,
  expressApp
}); // 🔋 new server instance 
pss.sources(sources); // ⚙️ sources to auto-generate routes
pss.broadcast(3000); // ⚡️ on port number 3000 
```

## Motivation

Often times, working in an "institutional" environment (education, finance, etc.) presents its own challenges with regard to legacy data sources: data that is deeply engrained in Enterprise software or legacy formats like RSS and XML. It is often the case that we have no control over how this data is generated or sent, which can be a blockade for developers seeking to add some newer "real-time" technology (like Websockets) to their stack.

**This library assumes that polling a remote data source for changed data is the only option, and seeks to remove that responsibilty from the client/browser.**

Instead of running `$.ajax()` calls inside a `setInterval()`, for example, and leaving the user's browser to do all the long-polling and heavy comparison logic, polling and comparison are moved *onto the server* where the intervals and data feeds can be centralized and *only send what's absolutely necessary* to the client with websockets.

Main goals:

- to have **only one interval per interval time value** running on the server
- to have **all intervals pause when no clients are listening**
- to provide **one unified feed of data per socket endpoint** to subscribe to
- to **only update data feeds when polled data has changed** and send it to subscribers
- to ensure **each client receives the last polled data** upon subscription

## Installation

Install it.

```bash
npm install mighty-polling-socket-server
# or...
yarn add mighty-polling-socket-server # hipster npm install
```

Require it.

```js
const { PollingSocketServer } = require('mighty-polling-socket-server');
```

## Examples

**Example material can be found in [`/example`](/example).** This includes basic usage examples for both included libraries:

- **[`/example/server`](/example/server):** a single-source RSS polling server that polls a mock data source found under its `data-examples` directory with a `PollingSocketServer` instance
- **[`/example/client`](/example/client):** a Typescript example that uses the included `SocketPollClient` class to listen for socket messages from the example server; uses included XML/RSS type definition helpers

All source material is thoroughly documented inline, and the core `PollingSocketServer` class contains many "internal" properties that can be subscribed to, i.e. to perform additional side effects outside those performed by this library (using its intervals/connections/etc).

## API Reference

### `PollingSocketServer`
Type: `PollingSocketServer`

Core class for instantiating a new server instance.

```js
const pss = new PollingSocketServer();
```

### `new PollingSocketServer(options)`
#### options
Type: `object`

An optional configuration object for global settings.

##### options.defaultInterval
Type: `number`
Default: `2000`

A global time interval to use if none is supplied to a source.

##### options.checkHeartbeat
Type: `boolean`
Default: `false`

Enable periodic "heartbeat" checks to scan for dropped socket connections.

##### options.expressApp
Type: `Express`
Default: `express()`

Provide an `express()` app to bring your own routes and configuration.

##### options.requestOptions
Type: `object`

Default options for supplying to every http request (can be overwritten in sources), i.e. those supported by [Request](https://github.com/request/request#requestoptions-callback).

##### options.wsOptions
Type: `object`

Options to pass into the WebSocketServer instantiation, i.e. those supported by [ws](https://github.com/websockets/ws/blob/master/doc/ws.md).

##### options.logging
Type: `boolean`
Default: `true`

Whether to enable server log messages for polling activity.

##### options.stats
Type: `boolean`
Default: `false`

**BETA** Whether to enable metrics routes. Sets up additional socket routes for monitoring:

- connected clients and their routes
- intervals and their ticks
- whether the server is idle
- a pipe of the log from `options.logging`

### `PollingSocketServer.sources(sources)`
#### sources
Type: `source[]`

Add sources to autogenerate routes, intervals and listeners for the polling server.

Takes an array of `source`s, which are configuration objects the support the properties below:

#### source
##### source.type
Type: `string`

**Required**

The `type` provides a type identifier for the source, as well as an endpoint URL if no `url` is provided.

```js
{ type: 'weather', ... }
// results in an endpoint of:
'/weather'
// and client messages in the form of:
{ type: 'weather', data: ... }
```

##### source.path
Type: `string`

**Optional**

An optional path for the endpoint, if you'd prefer it to differ from the `type`.

```js
{ type: 'weather', path: 'weather-reports', ... }
// results in an endpoint of:
'/weather-reports'
// while maintaining a client messages in the form of:
{ type: 'weather', data: ... }
```

##### source.url
Type: `string`

**Required**

The remote url to the data source for HTTP polling.

##### source.options
Type: `object`

**Optional**

An optional map of request options for polling this source via HTTP, i.e. those supported by [Request](https://github.com/request/request#requestoptions-callback).

```js
{ url: 'http://some.api.com/v2/weather.json', options }
// fetches data from that source using
RxHttpRequest.get('http://some.api.com/v2/weather.json', { ...defaults, ...options })
```

##### source.interval
Type: `number`

**Required**

The time interval at which to perform polling.

Each source gets its own interval to map to, although on the server, only one interval per interval value is running at a time to maximize efficiency. For example, having one source poll at 1000ms intervals and three sources polling at 2000ms intervals will only create two intervals.

##### source.compare
Type: `(oldData, newData) => boolean`

**Optional**

An optional function parameter for comparing returned poll data for changes.

Receives the last polled data and the current polled data as parameters, and should return a boolean to represent whether the two data sets are *equal*. 

```js
{
  compare: (oldData, newData) => (oldData.lastPublished === newData.lastPublished)
}
```

##### source.transform
Type: `(data) => any`

**Optional**

An optional function parameter for transforming returned poll data before it is sent to subscribed clients.

Receives the last polled data as a parameter, and should return another data representation of your choice.

```js
{
  tranform: data => Object.keys(data).reduce((final, key) => {
    if (key !== 'privateProperty') final[key] = data[key];
    return final;
  }, {})
}
```

##### source.xml
Type: `boolean`

**Optional**

Whether to parse the polled data as XML to JSON via `xml2js`. Useful for converting complex RSS structures.

### `PollingSocketServer.broadcast(port)`
#### port
Type: `number`

Instantiate the inner Express app and listen on the given `port`.

Add socket routes from polling sources with `sources()` before calling `broadcast()`.

### Instance properties

Each instance of `const pss = new PollingSocketServer()` has the following additional properties for accessing its internals:

#### pss.app

A reference to the Express app, e.g. for adding additional non-Websocket routes or otherwise configuring the router.

#### pss.wss

A reference to the WebSocketServer returned by the instantiation of `ws`.

#### pss.interval$

A map of activated polling interval `Observable`s (timing only), keyed by interval value. Can be subscribed to for performing additional actions at active intervals.

Example:
```js
pss.interval$['1000'].subscribe(tick => howManyTicks(tick));
```

#### pss.connection$

An `Observable` of the socket server's connection pool that emits `true` and `false` for connection and disconnection events, respectively. Can be subscribed to in order to monitor the pool.

Example:
```js
pss.connection$.subscribe(isConnection => {
  console.log(`New client ${!isConnection && 'dis'}connected`);
  console.log(`There are ${wss.clients.size} clients connected`);
});
```

#### pss.paused$

An `Observable` of the socket server's pause status. Convenience subscription for when you're only interested in monitoring the idle state.

Example:
```js
pss.paused$.subscribe(isPaused => {
  console.log(`Intervals are currently ${isPaused && 'in'}active`);
});
```

## Tests

None yet, TBD.

## Built With

* [RxJS](http://reactivex.io/rxjs/) - Reactive Extensions Library for JavaScript
* [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
* [express-ws](https://github.com/HenningM/express-ws) - WebSocket endpoints for Express applications
* [ws](https://github.com/websockets/ws) - Simple to use, blazing fast and thoroughly tested WebSocket client and server for Node.js
* [rx-http-request](https://github.com/njl07/rx-http-request) - The world-famous HTTP client Request now RxJS compliant
* [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) - Simple XML to JavaScript object converter

## License

[MIT](https://opensource.org/licenses/MIT)