import { RSS } from '../../lib';

import { MessageBase } from '.';

export const TYPE_EMERGENCY = 'emergency';
export type TYPE_EMERGENCY = typeof TYPE_EMERGENCY;

export class EmergencyMessage extends MessageBase {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: string;

  constructor(item: RSS.Item) {
    super();
    const content = this.extractContent(item);
    Object.assign(this, content);
  }

  private extractContent?({
    title: [title], description: [description],
    link: [link], guid: [{ _: guid }], pubDate: [pubDate]
  }: RSS.Item): EmergencyMessage {
    return {
      title, description, link,
      guid, pubDate: this.formatDate(pubDate),
    };
  }
}
