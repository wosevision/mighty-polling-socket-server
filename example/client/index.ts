import { SocketPollClient } from '../../client';

import {
  RSSUtility,
  RSSFeed
} from './rss-utility';
import {
  RSSExampleModel,
  RSS_EXAMPLE
} from './rss-example';

const rss = new RSSUtility();
const client = new SocketPollClient();

/**
 * Listens to incoming service disruption socket data. Responsible for
 * mapping `ServiceDisruptionRSSItem` objects to more useful `ServiceDisruption`
 * instances, and building a templated list from the items (if any).
 */
client.on<RSS_EXAMPLE, RSSFeed>(RSS_EXAMPLE, ({ data }) => {
  const rssItems = rss.parseItems(data, item => new RSSExampleModel(item));

  if (rssItems.length) {
    const header = '<h2>RSS Example</h2>';
    const html = rssItems.map((item: RSSExampleModel)  => `<div class="rss-example">
      <a href="${ item.link || item.guid }" ${ item.title ? `title="${ item.title }"` : ''}></a>
      ${ item.title ? `<p><strong><a href="${ item.link || item.guid }">${ item.title }</strong></a></p>` : ''}
      <p>${ item.description }</p>
      <small>${ item.pubDate }</small>
    </div>
    <hr/>`).join('\n');

    document.getElementById('rss-example').innerHTML = [header, html].join('\n');
  }
});