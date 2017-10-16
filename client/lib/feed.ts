import { SocketConnection, FeedReader } from '.';
import {
  ServiceDisruption,
  TYPE_DISRUPTION,
  TYPE_EMERGENCY,
  TYPE_WEATHER
} from './models';

/**
 * This class represents the base hub for all emergency feed related
 * messaging and action. Its primary purpose is to pre-initialize a
 * socket connection, as well as provide callback functions for all
 * emergency feed message types.
 * 
 * @example
 * // initialize a new feed
 * const feed = new EmergencyFeed();
 * // assign an action to a message type
 * feed.onServiceDisruption(items => {...});
 * 
 * @export
 * @class EmergencyFeed
 */
export class EmergencyFeed {

  private _onServiceDisruption = (items: ServiceDisruption[]) => { items };
  private _onEmergencyMessage = (items: any[]) => { items };
  private _onWeatherAlert = (items: any[]) => { items };

  private reader = new FeedReader();

  constructor(...types: (TYPE_DISRUPTION|'emergency'|'weather')[]) {
    types.forEach(type => this.addSocketListener(type));
  }

  /**
   * Initializes event listener for socket messages with the
   * pre-initialized socket connection; passes event data from
   * message to this class' `onMessage` method.
   * 
   * @private
   * @memberof EmergencyFeed
   */
  private addSocketListener(type) {
    const socket = new SocketConnection(null, type)
    socket.onMessage(event => this.onMessage(event));
    console.log(`[socket] added listener for "${type}"`);
  }

  /**
   * Receives a socket's `MessageEvent`; parses the raw string data
   * into a usable object; determines the type of emergency message
   * and calls the appropriate callback with the parsed data as its
   * first argument.
   * 
   * @private
   * @param {MessageEvent} event 
   * @memberof EmergencyFeed
   */
  private onMessage(event: MessageEvent) {
    const eventData = JSON.parse(event.data);
    console.log(`[socket] ${eventData.type} message received`, eventData);
    switch (eventData.type) {
      case TYPE_DISRUPTION:
        const serviceDisruptions = this.reader.parseServiceDisruptions(eventData.data);
        this._onServiceDisruption(serviceDisruptions);
        break;
      case TYPE_EMERGENCY:
        const emergencyMessages = this.reader.parseEmergencyMessages(eventData.data);
        this._onEmergencyMessage(emergencyMessages);
        break;
      case TYPE_WEATHER:
        const weatherAlerts = this.reader.parseWeatherAlerts(eventData.data);
        this._onWeatherAlert(weatherAlerts);
        break;
    }
  }

  /**
   * Register a service disruption callback.
   * 
   * @param {(items: ServiceDisruption[]) => void} callback 
   * @memberof EmergencyFeed
   */
  onServiceDisruption(callback: (items: ServiceDisruption[]) => void) {
    this._onServiceDisruption = callback;
  }
  /**
   * Register an emergency message callback.
   * 
   * @param {(items: any[]) => void} callback 
   * @memberof EmergencyFeed
   */
  onEmergencyMessage(callback: (items: any[]) => void) {
    this._onEmergencyMessage = callback;
  }
  /**
   * Register a weather alert callback.
   * 
   * @param {(items: any[]) => void} callback 
   * @memberof EmergencyFeed
   */
  onWeatherAlert(callback: (items: any[]) => void) {
    this._onWeatherAlert = callback;
  }
}