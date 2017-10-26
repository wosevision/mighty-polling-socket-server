export type RSSFeed = { rss: RSS.Feed };

const ONE_WEEK = 7*24*60*60*1000;
const COOKIE_NAME = 'last-takeover';

/**
 * Utility class for RSS feed parsing and actions
 * 
 * @export
 * @class RSSUtility
 */
export class RSSUtility {

  private _onFirstView: (data?: RSSFeed) => void;
  
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

  trackLastViewed(data: RSSFeed) {
    let cookieDate;
    try {
      const pubDate = (data.rss.channel[0].pubDate || data.rss.channel[0].item[0].pubDate)[0];
      cookieDate = new Date(pubDate).getTime().toString();
    } catch (err) {
      console.warn(`Error parsing RSS pubDate: ${err}`);
      return;
    }
    const lastViewedPubDate = this._getCookie(COOKIE_NAME);
    console.log(cookieDate, lastViewedPubDate)
    if (cookieDate !== lastViewedPubDate) {
      this._setCookie(COOKIE_NAME, cookieDate);
      this._onFirstView(data);
    }
  }

  onFirstView(callback: (data?) => void) {
    this._onFirstView = callback;
  }

  private _getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
  }
  private _setCookie(name, value) {
    const date = new Date();
    date.setTime(date.getTime() + ONE_WEEK);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/;`;
  }
}
