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
      url = `ws://${ window.document.location.host.replace(/:.*/, '') }:8080`; //dev
      // url = `wss://${ window.document.location.host.replace(/:.*/, '') }`; //live
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
