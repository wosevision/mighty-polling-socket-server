/**
 * Import specialized versions of `Observable` and `BehaviorSubject`
 * that have been augmented with imported operators and custom
 * instance methods.
 */
const { Observable, BehaviorSubject } = require('./rxjs');

class SocketMonitor {
  constructor(server) {

    const {
      connection$,
      intervalManager,
      paused$,
      logger$,
      app
    } = server;

    this._stats = new BehaviorSubject({});
    this.stats$ = this._stats
      .asObservable()
      .accumulate();

    const clientStats$ = this.getClientStats(connection$)
      .map(pool => ({ pool }));

    const intervalStats$ = this.getIntervalStats(interval$)
      .map(intervals => ({ intervals }));

    const idleStats$ = paused$.map(idle => ({ idle }));
    
    const logStats$ = logger$.map(log => ({ log }))

    const allStats$ = Observable.merge(
      clientStats$,
      intervalStats$,
      idleStats$,
      logStats$
    ).do(stat => this._stats.next(stat));
    
    app.ws(`/stats`, client => {
      const monitoring = allStats$.subscribe();

      const stats = this.stats$
        .map(data => JSON.stringify({ type: 'stats', data }))
        .flatMap(message => Observable.fromSocketSend(client, message))
        .catch(error => Observable.throw(error))
        .subscribe();

      /**
       * Subscribes to the active socket connection's `close` event
       * in order to clean up all subscriptions that were initiated
       * by the connection (including itself).
       */
      const closed = Observable.fromEvent(client, 'close').subscribe(() => {
        monitoring.unsubscribe();
        stats.unsubscribe();
        closed.unsubscribe();
      })
    });
  }

  getClientStats(connection$) {
    let clientId = 1;
    return connection$
      .scan((pool, { upgradeReq } = {}) => {
        if (upgradeReq) {
          const { url, connection: { remoteAddress: ipAddress } } = upgradeReq;
          const client = { [clientId]: { clientId, ipAddress }};
          pool[url] = pool[url]
            ? { ...pool[url], ...client }
            : [client];
          clientId++;
        }
        return pool;
      }, {});
  }

  getIntervalStats(intervalManager) {
    const mapToTicks = key => intervalManager._intervals[key].map(tick => ({ [key]: tick }));
    return Observable.merge(
      ...Object.keys(intervalManager._intervals).map(mapToTicks)
    ).accumulate();
  }
}

exports.SocketMonitor = SocketMonitor;
