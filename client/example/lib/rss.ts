import { RSS } from '../../lib';

/** Container type for `xml2js` RSS feeds */
export type RSSFeed = { rss: RSS.Feed };

/** One week in seconds */
const ONE_WEEK = 7*24*60*60*1000;
/** Cookie name to reuse for `trackLastViewed` */
const COOKIE_NAME = 'last-viewed-pubdate';

/**
 * Utility class for RSS feed parsing and actions.
 * 
 * @export
 * @class RSSUtility
 */
export class RSSUtility {
  /**
   * Shortcut for pulling `<item>` objects out of an RSS feed.
   * Receives an optional transform function that is applied
   * to the items after they are extracted. Returns an array of
   * either `RSS.Item` objects or a type specified in transform.
   * 
   * @template I 
   * @template T 
   * @param {RSSFeed} data 
   * @param {(item: I) => T} [transform] 
   * @returns {((T | I)[])} 
   * @memberof RSSUtility
   */
  parseItems<I extends RSS.Item, T>(data: RSSFeed, transform?: (item: I) => T): (T | I)[] {
    let channelItems: (T | I)[];
    try {
      channelItems = <I[]>data.rss.channel[0].item;
    } catch (err) {
      console.warn(`Error parsing RSS items: ${err}`);
      channelItems = [];
    }
    return transform ? channelItems.map(transform) : channelItems;
  }

  /**
   * Optionally check the publish date of an incoming RSS data object
   * against a cookie set to the publish date of the last viewed data.
   * If the dates do not match, stores the new date in the cookie. Returns
   * true if viewed already, false if not.
   * 
   * @param {RSSFeed} data
   * @memberof RSSUtility
   */
  checkViewStatus(data: RSSFeed) {
    let cookieDate;
    try {
      const pubDate = (data.rss.channel[0].pubDate || data.rss.channel[0].item[0].pubDate)[0];
      cookieDate = new Date(pubDate).getTime().toString();
    } catch (err) {
      console.warn(`Error parsing RSS pubDate: ${err}`);
      return;
    }
    const lastViewedPubDate = this._getCookie(COOKIE_NAME);
    if (cookieDate !== lastViewedPubDate) {
      this._setCookie(COOKIE_NAME, cookieDate);
      return false;
    } else {
      return true;
    }
  }

  /**
   * Gets a document cookie value by name.
   * 
   * @private
   * @param {any} name
   * @memberof RSSUtility
   */
  private _getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
  }

  /**
   * Sets a document cookie by name to a given value and sets
   * an expiry date of one week from now.
   * 
   * @private
   * @param {any} name 
   * @param {any} value 
   * @memberof RSSUtility
   */
  private _setCookie(name, value) {
    const date = new Date();
    date.setTime(date.getTime() + ONE_WEEK);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/;`;
  }
}
