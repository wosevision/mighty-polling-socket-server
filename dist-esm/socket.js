/**
 * Base class for providing a simple proxy to an instantiated
 * `WebSocket` connection.
 *
 * @export
 * @class SocketConnection
 */
export class SocketConnection {
    constructor(url, endpoint) {
        if (!url) {
            const { location } = document;
            const { host, protocol, port } = location;
            url = `${protocol.replace(/http/, 'ws')}//${host.replace(/:.*/, '')}${port ? ':8080' : ''}`;
        }
        url = `${url}/${endpoint || ''}`;
        this.connection = new WebSocket(url);
    }
    onMessage(callback) {
        this.connection.onmessage = callback;
    }
    close() {
        this.connection.close();
    }
    send(what) {
        this.connection.send(what);
    }
}
//# sourceMappingURL=socket.js.map