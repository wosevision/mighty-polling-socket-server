import { SocketPollClient } from '../lib';
import './styles/main.scss';

import {
  RSSUtility,
  RSSFeed,
  DomBuddy,
  Notification
} from './lib';
import { 
  ServiceDisruption,
  ServiceDisruptionRSSItem,
  EmergencyMessage,
  TYPE_DISRUPTION,
  TYPE_EMERGENCY,
} from './models';

const REDIRECT_URL = 'http://uoit.ca/emergency';
// const NOTIFY_DURATION = 3000;

const dom = new DomBuddy();
const rss = new RSSUtility();
const toast = new Notification();
const client = new SocketPollClient();

rss.onTakeover(() => {
  console.info('[rss-utility] takeover occurred');
  toast.notify(`<span class="icon_emergency alert text-larger"></span> <strong>Notice:</strong> You are about to be redirected to an emergency message!<br/><small>Redirecting in:</small> <strong class="countdown"></strong>`, {
    duration: 5000,
    className: 'alert',
    position: {
      // left: true,
      right: true,
      // top: true,
      bottom: true
    },
    // disableAnimation: true,
    onNotify() {
      let secondsLeft = 5;
      const countdownEl: Element = [...this.childNodes].find((el: Element) => {
        return el.classList && el.classList.contains('countdown')
      });
      countdownEl.innerHTML = `${secondsLeft} seconds`;
      const ticker = setInterval(() => {
        if (secondsLeft > 0) {
          secondsLeft--;
          countdownEl.innerHTML = `${secondsLeft} seconds`;
        } else {
          countdownEl.innerHTML = '';
          clearInterval(ticker);
        }
      }, 1000)
    }
  });
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
