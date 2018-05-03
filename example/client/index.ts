import { SocketPollClient } from '../../client';

import {
  RSSUtility,
  RSSFeed
} from './rss-utility';
import {
  RSSExampleModel,
  TYPE_RSS
} from './rss-example';
import {
  JSONExampleItem,
  TYPE_JSON
} from './json-example';

const rss = new RSSUtility();
const client = new SocketPollClient('ws://localhost:8080');

/**
 * Listens to incoming service disruption socket data. Responsible for
 * mapping `ServiceDisruptionRSSItem` objects to more useful `ServiceDisruption`
 * instances, and building a templated list from the items (if any).
 */
client.on<TYPE_RSS, RSSFeed>(TYPE_RSS, ({ data }) => {
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

client.on<TYPE_JSON, JSONExampleItem[]>(TYPE_JSON, ({ data }) => {

  if (data.length) {
    const header = '<h2>JSON Example</h2>';
    const html = data.map((item) => `<div class="rss-example">
      <a href="${ item.link || item.guid}" ${item.title ? `title="${item.title}"` : ''}></a>
      ${ item.title ? `<p><strong><a href="${item.link || item.guid}">${item.title}</strong></a></p>` : ''}
      <p>${ item.description}</p>
      <small>${ item.pubDate}</small>
    </div>
    <hr/>`).join('\n');

    document.getElementById('json-example').innerHTML = [header, html].join('\n');
  }
});

const TYPE_STATS = 'stats';
type TYPE_STATS = typeof TYPE_STATS;
type Stats = {
  pool: number;
  idle: boolean;
  intervals: any;
};
client.on<TYPE_STATS, Stats>('stats', ({ data }) => {
  console.info('[stats]', data)
});