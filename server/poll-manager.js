/**
 * Import specialized versions of `Observable` and `BehaviorSubject`
 * that have been augmented with imported operators and custom
 * instance methods.
 */
const { Observable, BehaviorSubject } = require('./rxjs');
const { RxHR } = require('@akanass/rx-http-request');

class PollManager {
  constructor(intervalManager, params, logger) {
    /**
     * Maps to hold:
     * - `BehaviorSubject`s that will be used to aggregate
     * received poll data
     * - `Observable`s from the subjects that clients can
     * subscribe to for receiving the subject's data
     * - "pollers", observables that connect a data source
     * to an interval and emit new data to its subject
     */
    this.subjects = {};
    this.observables = {};
    this.pollers = {};

    this.intervalManager = intervalManager;
    this.params = params;
    this.logger = logger;
  }
  addSources(sources) {
    /**
     * Adds new `BehaviorSubject`s to hold the incoming data from sources.
     */
    this.subjects = {
      ...this.subjects,
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
    this.observables = {
      ...this.observables,
      ...sources.reduce((final, { type }) => {
        final[type] = this.subjects[type].asObservable();
        return final;
      }, {})
    };

    /**
     * Adds fully-instantiated polling observables, keyed by source
     * type to match the `subjects` and `observables`. Provides a way
     * for each source to have its own comparison and result logic.
     */
    this.pollers = {
      ...this.pollers,
      ...sources.reduce((final, source) => {
        final[source.type] = this.getPoll(source);
        return final;
      }, {})
    };
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
  getPoll({
    type,
    url,
    options = {},
    interval = this.params.defaultInterval,
    compare = (_, __) => (_ === __),
    transform = _ => _,
    xml = false,
    json = true
  }) {
    // return this._getInterval(interval)
    return this.intervalManager.getInterval(interval)
      .do(() => this.logger.log('polling', `checking: ${type}`))
      .switchMap(() => RxHR.get(url, { ...this.params.requestOptions, ...options }))
      .do(() => this.logger.log('polling', `checked: ${type}`))
      .map(response => response.body)
      .parseJSON(json && !xml)
      .parseXML(xml)
      .distinctUntilChanged(compare)
      .map(transform)
      .do(data => {
        this.logger.log('polling', `changed: ${type}`)
        this.subjects[type].next(data);
      })
      .catch(error => {
        this.logger.log('error:polling', error)
        return Observable.throw(error);
      })
      .share();
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
  openClientPoll(type, client) {
    this.logger.log('app', `connection to /${type} detected`);

    // const {
    //   [CLIENT_ID_COOKIE]: clientId
    // } = cookie.parse(client.upgradeReq.headers.cookie);

    // if (!clientId) {
    //   Observable.fromEvent(this.wss, 'headers')
    //     .subscribe(headers => {
    //       const newClientId = crypto.randomBytes(20).toString('hex');
    //       const clientIdCookie = cookie.serialize(CLIENT_ID_COOKIE, newClientId);
    //       headers.push(`Set-Cookie: ${clientIdCookie}`)
    //     })
    // }
    // console.log(clientId)

    /**
     * Subsribes to an source type's poller to activate it.
     */
    const polling = this.pollers[type].subscribe();

    /**
     * Subscribes to the source type's observable `BehaviorSubject`
     * to receive incoming data that has been marked as new and the
     * last emitted data that was marked as new. Formats a message
     * for the client and sends it using the bound `sendAsObservable`.
     */
    const feed = this.observables[type]
      .filter(Boolean)
      .map(data => JSON.stringify({ type, data }))
      .do(message => this.logger.log('sending', message))
      .flatMap(message => Observable.fromSocketSend(client, message))
      .catch(error => {
        this.logger.log('error:sending', error)
        return Observable.throw(error);
      })
      .subscribe(() => this.logger.log('sending', 'send success'));

    /**
     * Subscribes to the active socket connection's `close` event
     * in order to clean up all subscriptions that were initiated
     * by the connection (including itself).
     */
    const closed = Observable.fromEvent(client, 'close').subscribe(() => {
      polling.unsubscribe();
      feed.unsubscribe();
      closed.unsubscribe();
    });
  }
}

exports.PollManager = PollManager;
