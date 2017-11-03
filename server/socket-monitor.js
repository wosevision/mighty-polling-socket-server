/**
 * Import specialized versions of `Observable` and `BehaviorSubject`
 * that have been augmented with imported operators and custom
 * instance methods.
 */
const { Observable, BehaviorSubject } = require('./rxjs');

class SocketMonitor {
  constructor(server) {

    this._stats = new BehaviorSubject({});
    this.stats$ = this._stats
      .asObservable()
      .accumulate();

    const {
      connection$,
      interval$,
      paused$,
      app,
      wss
    } = server;

    const clientStats$ = this.getClientStats(connection$);

    const intervalStats$ = this.getIntervalStats(interval$);

    const allStats$ = Observable.merge(clientStats$, intervalStats$)
      .do(stat => this._stats.next(stat));
    
    server.app.ws(`/stats`, client => {
      console.log(`[app] connection to /stats detected`);
      const monitoring = allStats$.subscribe();

      const stats = this.stats$
        .map(data => JSON.stringify({ type: 'stats', data }))
        .flatMap(message => Observable.fromSocketSend(client, message))
        .catch(error => {
          this._log('error:sending', error)
          return Observable.throw(error);
        })
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

  getIntervalStats(interval$) {
    const mapToTicks = key => interval$[key].map(tick => ({ [key]: tick }));
    return Observable.merge(
      ...Object.keys(interval$).map(mapToTicks)
    ).accumulate();
  }
}

exports.SocketMonitor = SocketMonitor;
