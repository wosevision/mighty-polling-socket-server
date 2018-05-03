import { SocketConnection } from '.';

/** Type for messages returned from socket server */
export type SocketPollMessage<T extends string, D> = {
  type: T,
  data: D
};

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

  constructor(private baseUrl?: string) { }

  /**
   * @template T 
   * @param {string} type 
   * @param {(items: T) => void} callback 
   * @memberof SocketPollClient
   */
  on<T extends string, D>(type: T, callback: (eventData: SocketPollMessage<T, D>) => void) {
    this._typeCallbacks[type] = callback;
    this.addSocketListener(type);
  }

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
  private addSocketListener<T extends string, D>(type: T) {
    const socket = new SocketConnection(this.baseUrl, type)
    socket.onMessage(event => this.onMessage<T, D>(type, event));
    console.log(`[socket] added listener for "${type}"`);
  }

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
  private onMessage<T extends string, D>(type: T, event: MessageEvent) {
    const eventData: SocketPollMessage<T, D> = JSON.parse(event.data);
    console.log(`[socket] ${eventData.type} message received`, eventData);
    this._typeCallbacks[type](eventData);
  }
}