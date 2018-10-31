/**
 * Base class for providing a simple proxy to an instantiated
 * `WebSocket` connection.
 * 
 * @export
 * @class SocketConnection
 */
export class SocketConnection {
  private connection: WebSocket;
  constructor(url?: string, endpoint?: string) {
    if (!url) {
      const { location } = document;
      const { host, protocol, port } = location;
      url = `${protocol.replace(/http/, 'ws')}//${ host.replace(/:.*/, '') }${ port ? `:${port}` : '' }`;
    }
    url = `${url}/${endpoint || ''}`;
    this.connection = new WebSocket(url);
  }
  onMessage(callback: (ev: MessageEvent) => any) {
    this.connection.onmessage = callback;
  }
  close() {
    this.connection.close();
  }
  send(what) {
    this.connection.send(what);
  }
}
