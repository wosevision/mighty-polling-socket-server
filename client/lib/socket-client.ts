import { SocketConnection } from '.';

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
export class SocketPollClient {

  private _typeCallbacks: {
    [type: string]: (items: any) => void
  } = {};

  on<T>(type: string, callback: (items: T) => void) {
    this._typeCallbacks[type] = callback;
    this.addSocketListener(type);
  }

  /**
   * Initializes event listener for socket messages with the
   * pre-initialized socket connection; passes event data from
   * message to this class' `onMessage` method.
   * 
   * @private
   * @memberof SocketPollClient
   */
  private addSocketListener(type: string) {
    const socket = new SocketConnection(null, type)
    socket.onMessage(event => this.onMessage(type, event));
    console.log(`[socket] added listener for "${type}"`);
  }

  /**
   * Receives a socket's `MessageEvent`; parses the raw string data
   * into a usable object; determines the type of emergency message
   * and calls the appropriate callback with the parsed data as its
   * first argument.
   * 
   * @private
   * @param {string} type 
   * @param {MessageEvent} event 
   * @memberof SocketPollClient
   */
  private onMessage(type: string, event: MessageEvent) {
    const eventData = JSON.parse(event.data);
    console.log(`[socket] ${eventData.type} message received`, eventData);
    this._typeCallbacks[type](eventData);
  }
}