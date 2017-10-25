import {
  SocketPollClient,
  FeedReader,
  DomBuddy
} from './lib';

import { 
  TYPE_DISRUPTION,
  TYPE_EMERGENCY
} from './lib/models';

type RSSFeed = { rss: RSS.Feed };
const REDIRECT_URL = 'http://uoit.ca/emergency';

const dom = new DomBuddy();
const feed = new FeedReader();
const client = new SocketPollClient();

client.on<TYPE_DISRUPTION, RSSFeed>(TYPE_DISRUPTION, ({ data }) => {
  const newsItems = feed.parseServiceDisruptions(data).map(item => `<div class="emergencyNewsItem">
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
  const newsItems = feed.parseEmergencyMessages(data).map(item => `<div class="emergencyMessageBar">
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
