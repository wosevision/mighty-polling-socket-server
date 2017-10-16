import { MessageBase, RawBase } from '.';

export const TYPE_DISRUPTION = 'disruption';
export type TYPE_DISRUPTION = typeof TYPE_DISRUPTION;

interface RawMedia {
  $: {
    description: string;
    url: string;
  }
  ['media:description']: string[];
}

interface RawServiceDisruption extends RawBase {
  ['media:content']: RawMedia[];
}

export class ServiceDisruption extends MessageBase {
  title: string;
  description: string;
  link: string;
  guid: string;
  summary: string;
  category: string[];
  pubDate: string;
  article: string;
  mediaContent?: string;
  mediaDescription?: string;

  constructor(item: RawServiceDisruption) {
    super();
    const content = this.extractContent(item);
    Object.assign(this, content);
  }

  private extractContent?({
    title: [title], description: [description], link: [link],
    guid: [guid], summary: [summary], category,
    article: [article], pubDate: [pubDate],
    ['media:content']: rawMedia
  }: RawServiceDisruption): ServiceDisruption {
    let media = {};

    if (rawMedia && rawMedia.length) {
      const [{
        $: { url: mediaContent, description: mediaDescription }
      }] = rawMedia;
      media = { mediaContent, mediaDescription };
    }

    return {
      title, description, link,
      guid, summary, category,
      pubDate: this.formatDate(pubDate),
      article, ...media
    };
  }
}
