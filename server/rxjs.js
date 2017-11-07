const { Observable } = require('rxjs/Observable');
const { BehaviorSubject } = require('rxjs/BehaviorSubject');
require('rxjs/add/observable/bindNodeCallback');
require('rxjs/add/observable/fromEvent');
require('rxjs/add/observable/interval');
require('rxjs/add/observable/throw');
require('rxjs/add/observable/never');
require('rxjs/add/observable/merge');
require('rxjs/add/operator/distinctUntilChanged');
require('rxjs/add/operator/switchMap');
require('rxjs/add/operator/mergeMap');
require('rxjs/add/operator/filter');
require('rxjs/add/operator/share');
require('rxjs/add/operator/catch');
require('rxjs/add/operator/mapTo');
require('rxjs/add/operator/scan');
require('rxjs/add/operator/map');
require('rxjs/add/operator/do');

/**
 * Converts `xml2js.parseString` into a function that returns an observable
 * of the parsed result (using `bindNodeCallback` as factory).
 */
const parseXMLAsObservable = Observable.bindNodeCallback(require('xml2js').parseString);

/**
 * Patches the `Observable` prototype to include a method for gathering
 * emitted objects and merging them as they are received.
 */
Observable.prototype.accumulate = function () {
  return this.scan((combined, latest) => {
    Object.assign(combined, latest);
    return combined;
  }, {});
}

/**
 * Patches the `Observable` prototype to include a method for pausing
 * and resuming the emission of a given observable.
 */
Observable.prototype.pausable = function(paused$) {
  return paused$.switchMap(paused => paused ? Observable.never() : this);
}

/**
 * Patches the `Observable` prototype to include a method for parsing
 * XML from XML-like strings and observing the output.
 */
Observable.prototype.parseXML = function(isXML) {
  return isXML ? this.switchMap(data => parseXMLAsObservable(data)) : this;
}

/**
 * Patches the `Observable` prototype to include a method for parsing
 * XML from XML-like strings and observing the output.
 */
Observable.prototype.parseJSON = function (isJSON) {
  return isJSON ? this.map(data => JSON.parse(data)) : this;
}

/**
 * Binds the callback of the incoming client's `send()` method
 * to an observable that emits an error if the send fails.
 */
Observable.fromSocketSend = function(client, message) {
  return Observable.bindNodeCallback(client.send).call(client, message);
}

exports = module.exports = { Observable, BehaviorSubject };