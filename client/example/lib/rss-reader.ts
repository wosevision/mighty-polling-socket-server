export type RSSFeed = { rss: RSS.Feed };

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
export class RSSReader {
  getItems<I extends RSS.Item, T>(data: RSSFeed, transform?: (item: I) => T): (T | I)[] {
    let channelItems: (T | I)[];
    try {
      channelItems = <I[]>data.rss.channel[0].item;
    } catch (err) {
      console.error(`Error parsing RSS items: ${err}`);
      channelItems = [];
    }
    return transform ? channelItems.map(transform) : channelItems;
  }
}
