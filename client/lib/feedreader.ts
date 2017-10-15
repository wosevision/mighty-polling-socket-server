import { ServiceDisruption } from './models'

/**
 * Utility class for parsing feed types into fully-instantiated
 * versions of their model classes.
 * 
 * @example
 * const socket = new SocketConnection;
 * const reader = new FeedReader;
 * socket.onMessage(event => {
 *   const eventData = JSON.parse(event.data);
 *   // assuming `eventData.type === 'disruption'`...
 *   const serviceDisruptions = reader.parseServiceDisruptions(eventData.data);
 *   // ...this outputs an array of `ServiceDisruption`s
 *   console.log(serviceDisruptions);
 * });
 * 
 * @export
 * @class FeedReader
 */
export class FeedReader {
  parseServiceDisruptions(data) {
    const channelItems = data.rss.channel[0].item;
    return channelItems.map(item => new ServiceDisruption(item));
  }
  parseEmergencyMessages(items) { return [...items]; }
  parseWeatherAlerts(items) { return [...items]; }
}
