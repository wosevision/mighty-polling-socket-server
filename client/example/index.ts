import { SocketPollClient } from '../lib';
import './styles/main.scss';

import {
  RSSUtility,
  RSSFeed,
  DomBuddy
} from './lib';
import { 
  ServiceDisruption,
  ServiceDisruptionRSSItem,
  EmergencyMessage,
  TYPE_DISRUPTION,
  TYPE_EMERGENCY,
} from './models';

const REDIRECT_URL = 'http://uoit.ca/emergency';

const dom = new DomBuddy();
const rss = new RSSUtility();
const client = new SocketPollClient();

rss.onTakeover(() => {
  console.info('[rss-utility] takeover occurred');
  rss.notifyUser('Taking over!', null, 'alert', () => alert('taken over!'));
});

client.on<TYPE_DISRUPTION, RSSFeed>(TYPE_DISRUPTION, ({ data }) => {
  const newsItems = rss.parseItems(data, (item: ServiceDisruptionRSSItem) => new ServiceDisruption(item))
    .map((item: ServiceDisruption)  => `<div class="emergencyNewsItem">
      <a href="${ item.link }" title="${ item.title }"><img src="${ item.mediaContent }" alt="${ item.mediaDescription }" width="100" height="67"></a>
      <p><strong><a href="${ item.link }">${ item.title }</strong></a></p>
      <p class="date">${ item.pubDate }</p>
    </div>`);

  if (newsItems.length) {
    const header = '<hr><h2>Service disruption news</h2>';
    const html = newsItems.join('\n');
    const container = document.getElementById('disruptions');
    dom.clear(container)
      // .then.addClass('test').to(container)
      .then.prepend(header).to(container)
      .then.append(html).to(container)
      // .then.removeClass('test').from(container)
  }
});

client.on<TYPE_EMERGENCY, RSSFeed>(TYPE_EMERGENCY, ({ data }) => {
  rss.checkTakeover(data);
  const newsItems = rss.parseItems(data, item => new EmergencyMessage(item))
    .map(item => `<div class="emergencyMessageBar">
      <div class="row">
        <a href="${REDIRECT_URL}">
          <div class="emergencyAlert">
          Emergency Alert
          </div>
          <div class="emergencyMessage">
            <span class="emergencyTitle">${item.title}</span>
            <span class="emergencyDesc">${item.description}</span>
            <span class="emergencyDate">${item.pubDate}</span>
          </div>
        </a>
      </div>
    </div>`);

  if (newsItems.length) {
    const header = '<hr><h2>Emergency messages</h2>';
    const html = newsItems.join('\n');
    const container = document.getElementById('messages');
    dom.clear(container)
      // .then.addClass('test').to(container)
      .then.prepend(header).to(container)
      .then.append(html).to(container)
      // .then.removeClass('test').from(container)
  }
});
