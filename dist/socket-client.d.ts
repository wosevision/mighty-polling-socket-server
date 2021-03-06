/** Type for messages returned from socket server */
export declare type SocketPollMessage<T extends string, D> = {
    type: T;
    data: D;
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
export declare class SocketPollClient {
    private baseUrl?;
    private _typeCallbacks;
    constructor(baseUrl?: string);
    /**
     * @template T
     * @param {string} type
     * @param {(items: T) => void} callback
     * @memberof SocketPollClient
     */
    on<T extends string, D>(type: T, callback: (eventData: SocketPollMessage<T, D>) => void): void;
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
    private addSocketListener;
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
    private onMessage;
}
