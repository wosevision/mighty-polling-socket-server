# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0]
### Added
- Beta of new `stats` configuration option that sets up routes for watching socket server metrics, i.e. for dashboards or monitoring
- More configurability for server-level logging

### Fixed
- Fixes to shared subscriptions, duplicated logs
- Critical typo: public property for subscription, `connnection$` (three `n`s), fixed

## [1.1.4 - 1.1.6] - 2017-11-1

**Botched publish caused version jumps**

### Fixed
- Sorted out separation of built files for client library consumers:
  - Bundled files under `_bundles`
  - Compiled ES5 modules using `require()` inside `dist`
  - Compiled ES6 modules using `import *` inside `dist-esm`
  - Original TS files kept in `client`
  - Server files left as package.json `main` field to leave server untouched

## [1.1.3] - 2017-10-31
### Fixed
- Autodetection of secure websocket endpoints (`wss://`) when client library connects from HTTPS

## [1.1.2] - 2017-10-31
### Changed
- Example material reworked to be more generic:
  - no longer contains implementation details specific to the project that spurred the creation of this library
  - single basic RSS example with server and client
  - includes webpack dev server npm script for local testing
- No changes to library itself / patch release

## [1.1.1] - 2017-10-30
### Changed
- `RSS.Extras` type definitions changed to live under to `RSSExtras` module

### Fixed
- Export of bundled utility types (XML, RSS, etc) for TS consumers fixed
- Fixed import confusion between client/server libraries with `package.json` fields for `main` (server) and `module` (client)

### Added
- Better JSdocs/TSdocs for IDEs

## [1.1.0] - 2017-10-27
### Added
- New configuration options that enable:
  - a default interval to be set
  - a socket heartbeat checker
  - the ability to bring your own express app
  - options for passing to `ws`
  - options to set for every HTTP request
- Source configuration property `options` for passing HTTP options to different poll types
- Client side examples and the beginnings of a library:
  - library source under `client/lib`
  - includes _**.d.ts**_ type definitions under `client/lib/types` for:
    - `xml2js`-style objects (JS from XML) + helpers for extending
    - RSS2.0 feeds parsed with `xml2js`, made with provided XML helpers
    - RSS extras as examples of how to further extend types with provided helpers
  - example client source under `client/example`
  - includes examples of how to build classes that listen to polling socket server (uses XML examples in `server/example/xml)

## [1.0.1] - 2017-10-25
### Changed
- Switched `axios` to `rx-http-request` for a more "reactive" approach to HTTP

## [1.0.0] - 2017-10-15
### Added
- First release adds `PollingSocketServer` class for setting up new servers
- `sources()` method for adding sources / autogenerating intervals, pollers and routes
- `source` configurations that include:
  - `type` (of message)
  - `path` (of endpoint)
  - `url` (of polling source)
  - `compare` (function for diffing)
  - `transform` (function for mods)
  - `interval` (at which to poll)
  - `xml` (whether to parse XML)
- `broadcast()` method for listening to port number via Express
- convenience properties of:
  - `app` (Express app)
  - `wss` (WebSocketServer)
- `Observable` properties for:
  - `interval$` (map of tickers)
  - `connection$` (client actions)
  - `paused$` (idle status)
- some example material under `server/example`
