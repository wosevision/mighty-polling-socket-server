# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
