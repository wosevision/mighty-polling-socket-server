"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base class for providing a simple proxy to an instantiated
 * `WebSocket` connection.
 *
 * @export
 * @class SocketConnection
 */
var SocketConnection = /** @class */ (function () {
    function SocketConnection(url, endpoint) {
        if (!url) {
            var location_1 = document.location;
            var host = location_1.host, protocol = location_1.protocol, port = location_1.port;
            url = protocol.replace(/http/, 'ws') + "//" + host.replace(/:.*/, '') + (port ? ":" + port : '');
        }
        url = url + "/" + (endpoint || '');
        this.connection = new WebSocket(url);
    }
    SocketConnection.prototype.onMessage = function (callback) {
        this.connection.onmessage = callback;
    };
    SocketConnection.prototype.close = function () {
        this.connection.close();
    };
    SocketConnection.prototype.send = function (what) {
        this.connection.send(what);
    };
    return SocketConnection;
}());
exports.SocketConnection = SocketConnection;
//# sourceMappingURL=socket.js.map