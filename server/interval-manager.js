const { Observable } = require('./rxjs');

class IntervalManager {
  constructor(pauser, logger) {
    /**
     * A map to hold pausable intervals, which ensures there is
     * at most one interval running per interval time value;
     * property to hold default interval value.
     */
    this.intervals = {};

    this.pauser = pauser;
    this.logger = logger;
  }

  /**
   * Generates a pausable interval that ticks every _x_ ms and
   * can be paused/resumed by emitting true and false from the
   * `pauser` observable, and saves it to the `intervals` map.
   * 
   * If there is already a saved interval, returns the interval
   * so there is only one running per time value.
   * 
   * @param {number} value The time to elapse between interval ticks
   * @returns {Observable<number>}
   * @memberof IntervalManager
   */
  getInterval(value) {
    if (!this.intervals[value]) {
      /**
       * If there is no interval already saved in the `intervals` map
       * by this number, initialize it.
       */
      this.intervals[value] = Observable.interval(value)
        .pausable(this.pauser)
        .do(tick => this.logger.log('interval', `${value}ms, tick ${tick}`))
        .share();
    }
    return this.intervals[value];
  }
}

exports.IntervalManager = IntervalManager;