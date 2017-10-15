import {
  EmergencyFeed,
  DomBuddy
} from './lib';

import { 
  TYPE_DISRUPTION
} from './lib/models';

const dom = new DomBuddy();
const feed = new EmergencyFeed(TYPE_DISRUPTION);

feed.onServiceDisruption(items => {
  const newsItems = items.map(item => `<div class="emergencyNewsItem">
    <a href="${ item.link }" title="${ item.title }"><img src="${ item.mediaContent }" alt="${ item.mediaDescription }" width="100" height="67"></a>
    <p><strong><a href="${ item.link }">${ item.title }</strong></a></p>
    <p class="date">${ item.pubDate }</p>
  </div>`)

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

feed.onEmergencyMessage(items => {
  console.log('EMERG', items)
});
