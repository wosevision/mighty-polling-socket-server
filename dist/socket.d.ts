/**
 * Base class for providing a simple proxy to an instantiated
 * `WebSocket` connection.
 *
 * @export
 * @class SocketConnection
 */
export declare class SocketConnection {
    private connection;
    constructor(url?: string, endpoint?: string);
    onMessage(callback: (ev: MessageEvent) => any): void;
    close(): void;
    send(what: any): void;
}
