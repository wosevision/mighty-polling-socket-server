/**
 * Import specialized versions of `Observable` and `BehaviorSubject`
 * that have been augmented with imported operators and custom
 * instance methods.
 */
const { Observable, BehaviorSubject } = require('./rxjs');

class SocketLogger {
  constructor(logging) {
    /**
     * Holds a logging subject and exposes its observable.
     */
    this._logger = new BehaviorSubject({ source: 'log', message: 'starting' });
    this.log$ = this._logger.asObservable()
      .filter(Boolean)
      .map(({ source, message }) => `[${source}] ${message}`);
    
    if (logging) {
      this.log$.subscribe(log => console.log(log));
    }
  }

  /**
   * Sends a log message to the logger `BehaviorSubject` – the
   * log is only processed if it is enabled (and subscribed to).
   * 
   * @param {string} source
   * @param {string} message 
   */
  log(source, message) {
    this._logger.next({ source, message });
  }
}

exports.SocketLogger = SocketLogger;