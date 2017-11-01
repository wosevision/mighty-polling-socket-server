import { RSS } from '../../client';

export const RSS_EXAMPLE = 'rss-example';
export type RSS_EXAMPLE = typeof RSS_EXAMPLE;

export class RSSExampleModel {

  private static months = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December'
  ];

  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: string;

  constructor(item: RSS.Item) {
    const content = this.extractContent(item);
    Object.assign(this, content);
  }

  private extractContent?(item: RSS.Item): RSSExampleModel {
    const {
      description: [description],
      pubDate: [pubDate],
      guid: [{ _: guid }]
    } = item;
    const [title] = item.title || [null];
    const [link] = item.link || [null];
    return {
      title, description, link,
      guid, pubDate: this.formatDate(pubDate),
    };
  }

  private formatDate?(dateString) {
    const date = new Date(dateString);
    return [
      RSSExampleModel.months[date.getMonth()],
      ' ', date.getDate(),
      ', ', date.getFullYear(),
      ' ', date.getHours(),
      ':', date.getMinutes()
    ].join('');
  }
}
