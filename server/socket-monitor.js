/**
 * Import specialized versions of `Observable` and `BehaviorSubject`
 * that have been augmented with imported operators and custom
 * instance methods.
 */
const { Observable, BehaviorSubject } = require('./rxjs');

class SocketMonitor {
  constructor(server) {

    this._statsSubject = new BehaviorSubject({});
    this.stats$ = this._statsSubject
      .asObservable()
      .accumulate();

    const {
      connnection$,
      interval$,
      paused$,
      app,
      wss
    } = server;

    this._stats = [
      connnection$
        .map(() => ({ pool: wss.clients.size })),
      Observable.pairs(interval$)
        .map(([key, value]) => ({ [key]: value })),
      paused$.map(idle => ({ idle }))
    ];

    this._stats.forEach(stat => {
      stat.do(value => this._statsSubject.next(value)).subscribe();
    });
    
    server.app.ws(`/stats`, client => {
      console.log(`[app] connection to /stats detected`);

      const stats = this.stats$
        .subscribe(data => {
          const message = JSON.stringify({ type: 'stats', data });
          client.send(message);
        });

      /**
       * Subscribes to the active socket connection's `close` event
       * in order to clean up all subscriptions that were initiated
       * by the connection (including itself).
       */
      const closed = Observable.fromEvent(client, 'close').subscribe(() => {
        stats.unsubscribe();
        closed.unsubscribe();
      })
    });
  }
}

exports.SocketMonitor = SocketMonitor;
