"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
/**
 * This class represents the base hub for all socket poll related
 * messaging and action. Its primary purpose is to pre-initialize a
 * socket connection, as well as provide callback functions for all
 * configured message types.
 *
 * @example
 * // configure a message type
 * const TYPE_EMERGENCY = 'emergency';
 * // initialize a new feed
 * const feed = new SocketPollClient();
 * // assign an action to a message type
 * feed.on(TYPE_EMERGENCY, items => {...});
 *
 * @export
 * @class SocketPollClient
 */
var SocketPollClient = /** @class */ (function () {
    function SocketPollClient() {
        this._typeCallbacks = {};
    }
    /**
     * @template T
     * @param {string} type
     * @param {(items: T) => void} callback
     * @memberof SocketPollClient
     */
    SocketPollClient.prototype.on = function (type, callback) {
        this._typeCallbacks[type] = callback;
        this.addSocketListener(type);
    };
    /**
     * Initializes event listener for socket messages with the
     * pre-initialized socket connection; passes event data from
     * message to this class' `onMessage` method.
     *
     * @private
     * @template T
     * @template D
     * @param {T} type
     * @memberof SocketPollClient
     */
    SocketPollClient.prototype.addSocketListener = function (type) {
        var _this = this;
        var socket = new _1.SocketConnection(null, type);
        socket.onMessage(function (event) { return _this.onMessage(type, event); });
        console.log("[socket] added listener for \"" + type + "\"");
    };
    /**
     * Receives a socket's `MessageEvent`; parses the raw string data
     * into a usable object; determines the type of emergency message
     * and calls the appropriate callback with the parsed data as its
     * first argument.
     *
     * @private
     * @template T
     * @template D
     * @param {T} type
     * @param {MessageEvent} event
     * @memberof SocketPollClient
     */
    SocketPollClient.prototype.onMessage = function (type, event) {
        var eventData = JSON.parse(event.data);
        console.log("[socket] " + eventData.type + " message received", eventData);
        this._typeCallbacks[type](eventData);
    };
    return SocketPollClient;
}());
exports.SocketPollClient = SocketPollClient;
//# sourceMappingURL=socket-client.js.map