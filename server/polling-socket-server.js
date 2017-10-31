const path = require('path');
const express = require('express');
const expressWs = require('express-ws');

/**
 * Import specialized versions of `Observable` and `BehaviorSubject`
 * that have been augmented with imported operators and custom
 * instance methods.
 */
const { Observable, BehaviorSubject } = require('./rxjs');
const { RxHttpRequest } = require('rx-http-request');

/**
 * Core class for instantiating a new server.
 * 
 * @class PollingSocketServer
 * @param {object} [params] Optional configuration parameters 
 * @param {number} [params.defaultInterval=2000] Global time interval if none supplied
 * @param {boolean} [params.checkHeartbeat=false] Enable periodic checks for dropped connections
 * @param {object} [params.expressApp] Bring your own `express()` app with routes configured
 * @param {object} [params.requestOptions] Default options for every http request
 * @param {object} [params.wsOptions] Options to pass into `ws` socket server
 */
class PollingSocketServer {
  constructor({
    defaultInterval = 2000,
    checkHeartbeat = false,
    expressApp = express(),
    requestOptions,
    wsOptions
  } = {}) {
    /**
     * Save some options to parameter map.
     */
    this._params = { defaultInterval, requestOptions };
    /**
     * Creates an `express` app, mounts the express app
     * onto an `express-ws` instance, and saves a reference
     * to the socket server for later use.
     */
    this.app = expressApp;
    this.wss = expressWs(this.app, null, { wsOptions }).getWss();
    
    /**
     * A map to hold pausable intervals, which ensures there is
     * at most one interval running per interval time value;
     * property to hold default interval value.
     */
    this.interval$ = {};

    /**
     * Maps to hold:
     * - `BehaviorSubject`s that will be used to aggregate
     * received poll data
     * - `Observable`s from the subjects that clients can
     * subscribe to for receiving the subject's data
     * - "pollers", observables that connect a data source
     * to an interval and emit new data to its subject
     */
    this._subjects = {};
    this._observables = {};
    this._pollers = {};

    /**
     * Tracks all connection events (open and close) in a single
     * observable and reports number of connections.
     */
    this.connnection$ = this._getConnections();

    /**
     * A "pauser" observable that emits when a connection is opened
     * or closed; emits true if there are no connections remaining
     * and false if so (if the emission is different from previous).
     */
    this.paused$ = this.connnection$
      .map(() => this.wss.clients.size === 0)
      .distinctUntilChanged()
      .do(status => console.log(`[interval] ${status ? 'idle' : 'active'}`));

    /**
     * Enable periodic checks for dropped connections if enabled.
     */
    if (checkHeartbeat) {
      this._enableHeartbeatCheck();
    }

  }

  /**
   * Adds sources to the list of things to poll, i.e. instantiates polling
   * routes that clients can connect to. Each unique `source` sets up:
   * 
   * - a subject to receive new data, e.g. the polling "input"
   * - an observable of each subject as a feed, e.g. the polling "output"
   * - a poller from `_getPoll()` for comparing and passing the source's data,
   * e.g. the polling "pipeline"
   * - a route for clients to connect to, which activates a poller and
   * subscribes/unsubscribes to its source feed when connected/disconnected
   * 
   * @param {any} sources 
   * @memberof PollingSocketServer
   */
  sources(sources) {
    /**
     * Adds new `BehaviorSubject`s to hold the incoming data from sources.
     */
    this._subjects = {
      ...this._subjects,
      ...sources.reduce((final, { type }) => {
        final[type] = new BehaviorSubject(null);
        return final;
      }, {})
    };

    /**
     * Adds observable-only versions of each subject for connected clients
     * to individually subscribe to, so that the latest feed data
     * can be shared between clients.
     */
    this._observables = {
      ...this._observables,
      ...sources.reduce((final, { type }) => {
        final[type] = this._subjects[type].asObservable();
        return final;
      }, {})
    };
    
    /**
     * Adds fully-instantiated polling observables, keyed by source
     * type to match the `subjects` and `observables`. Provides a way
     * for each source to have its own comparison and result logic.
     */
    this._pollers = {
      ...this._pollers,
      ...sources.reduce((final, source) => {
        final[source.type] = this._getPoll(source);
        return final;
      }, {})
    };
    
    /**
     * Initializes an `express` app route for each source type.
     * Each route receives the type key as its route endpoint
     * and as a pointer to the correct `poller` and feed.
     */
    sources.forEach(({ type, path }) => {
      this.app.ws(`/${path || type}`, client => this._openClientPoll(type, client));
    });
  }

  /**
   * Activates socket server and Express app; listens on given port.
   * 
   * @param {number} [port=8080] The port to listen on
   * @memberof PollingSocketServer
   */
  broadcast(port = 8080) {
    return Observable.bindNodeCallback(this.app.listen)(port)
      .catch(err => console.log(`[error] ${err}`))
      .subscribe(() => console.log(`[server] listening on port ${port}`));
  }

  /**
   * Transforms a `source` object into a `poller`, which are each
   * responsible for:
   * 
   * - attaching the source to an interval returned by `_getInterval()`
   * - sending HTTP requests to the source on each tick
   * - comparing the last received data to the latest
   * - transforming data after it has been marked as changed
   * - passing transformed data to the source's associated `BehaviorSubject`
   * so it can be aggregated into that sources observable data feed
   * 
   * @param {object} params
   * @param {string} type The data/message type
   * @param {string} url The endpoint to poll via http
   * @param {object} options Optional request options for this poll
   * @param {(oldData, newData) => boolean} compare A comparison function
   * @param {(data) => any} transform A transformation function
   * @param {boolean} xml Whether to parse data as XML
   * @returns {Observable<any>}
   * @memberof PollingSocketServer
   */
  _getPoll({
    type,
    url,
    options = {},
    interval = this._params.defaultInterval,
    compare = (_, __) => (_ === __),
    transform = _ => _,
    xml = false,
  }) {
    return this._getInterval(interval)
      .do(data => console.log(`[polling] checking: ${type}`))
      .switchMap(() => RxHttpRequest.get(url, { ...this._params.requestOptions, ...options }))
      .do(data => console.log(`[polling] checked: ${type}`))
      .map(response => response.body)
      .parseXML(xml)
      .distinctUntilChanged(compare)
      .map(transform)
      .do(data => {
        console.log(`[polling] changed`, data);
        this._subjects[type].next(data);
      })
      .catch(error => {
        console.error(error);
        return Observable.throw(error);
      })
      .share();
  }

  /**
   * Generates a pausable interval that ticks every _x_ ms and
   * can be paused/resumed by emitting true and false from the
   * `paused$` observable, and saves it to the `interval$` map.
   * 
   * If there is already a saved interval, returns the interval
   * so there is only one running per time value.
   * 
   * @param {number} interval The time to elapse between interval ticks
   * @returns {Observable<number>}
   * @memberof PollingSocketServer
   */
  _getInterval(interval) {
    if (!this.interval$[interval]) {
      /**
       * If there is no interval already saved in the `interval$` map
       * by this number, initialize it.
       */
      this.interval$[interval] = Observable.interval(interval)
        .pausable(this.paused$)
        .do(tick => console.log(`[interval] ${interval}ms, tick ${tick}`))
        .share();
    }
    /**
     * Subscribe to the new or pre-existing interval and return it.
     */
    this.interval$[interval].subscribe();
    return this.interval$[interval];
  }

  /**
   * Returns an Observable that tracks all connection events
   * (open and close) in a single source and reports the number
   * of active connections when it changes.
   * 
   * @memberof PollingSocketServer
   */
  _getConnections() {
    /**
     * Emits incoming socket connections as they connect
     * and shares the connection with all its subscribers.
     */
    this.connectionOpened$ = Observable
      .fromEvent(this.wss, 'connection')
      .share();
    /**
     * Takes an incoming socket connection and maps it to
     * an observable for the closing of that connection.
     */
    this.connectionClosed$ = this.connectionOpened$
      .flatMap(ws => Observable.fromEvent(ws, 'close'))
      .mapTo(false);

    /**
     * Emits a connection event for each new connection,
     * and `false` when a connection has closed.
     */
    return Observable
      .merge(this.connectionOpened$, this.connectionClosed$)
      .do(state => console.log(`[websocket] client ${state ? '' : 'dis'}connected, pool: ${this.wss.clients.size}`));
  }
  
  /**
   * Sets up subscriptions for connected socket clients. When
   * a new client hits an endpoint, this method is used to:
   * 
   * - subscribe to the appropriate poll to activate it
   * - subscribe to the observable that will emit that poll's results
   * - provide its own teardown (unsubscribe) logic.
   * 
   * @param {string} type 
   * @param {any} client
   * @memberof PollingSocketServer
   */
  _openClientPoll(type, client) {
    console.log(`[app] connection to /${type} detected`);
    /**
     * Subsribes to an source type's poller to activate it.
     */
    const polling = this._pollers[type].subscribe();

    /**
     * Subscribes to the source type's observable `BehaviorSubject`
     * to receive incoming data that has been marked as new, as
     * well as the last emitted data that was marked as new.
     */
    const feed = this._observables[type].subscribe(data => {
      const message = JSON.stringify({ type, data });
      client.send(message);
    });
  
    /**
     * Subscribes to the active socket connection's `close` event
     * in order to clean up all subscriptions that were initiated
     * by the connection (including itself).
     */
    const closed = Observable.fromEvent(client, 'close').subscribe(() => {
      polling.unsubscribe();
      feed.unsubscribe();
      closed.unsubscribe();
    })
  }

  /**
   * Sets up the optional "heartbeat check", which subscribes to
   * new connections' `pong` events to periodically check that the
   * connection wasn't dropped in tandem with a 30 second interval.
   * 
   * @memberof PollingSocketServer
   */
  _enableHeartbeatCheck() {
    const heartbeat = function (ev) {
      console.log('[heartbeat]\n', ev);
      this.isAlive = true;
    };
    this._getInterval(30000)
      .do(() => this.wss.clients.forEach(ws => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping('', false, true);
      }));
    this.connectionOpened$
      .switchMap(ws => {
        ws.isAlive = true;
        return Observable.fromEvent(ws, 'pong')
      })
      .subscribe(heartbeat);
  }
}

exports.PollingSocketServer = PollingSocketServer;