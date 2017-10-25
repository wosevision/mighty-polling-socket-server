import { MessageBase } from '.';

export const TYPE_DISRUPTION = 'disruption';
export type TYPE_DISRUPTION = typeof TYPE_DISRUPTION;

export type ServiceDisruptionRSSItemContent = {
  summary: string;
  article: string;
}
export type ServiceDisruptionRSSItem = RSS.Extras.ItemWithMedia & XML.WithContent<ServiceDisruptionRSSItemContent>

export class ServiceDisruption extends MessageBase {
  title: string;
  description: string;
  link: string;
  guid: string;
  summary: string;
  category: string;
  pubDate: string;
  article: string;
  mediaContent?: string;
  mediaDescription?: string;

  constructor(item: ServiceDisruptionRSSItem) {
    super();
    const content = this.extractContent(item);
    Object.assign(this, content);
  }

  private extractContent?({
    title: [title], description: [description], link: [link],
    guid: [{ _: guid }], summary: [summary],
    article: [article], pubDate: [pubDate],
    category: rawCategory, ['media:content']: rawMedia
  }: ServiceDisruptionRSSItem): ServiceDisruption {
    let category, media = {};

    if (rawMedia && rawMedia.length) {
      const [{
        $: { url: mediaContent, description: mediaDescription }
      }] = rawMedia;
      media = { mediaContent, mediaDescription };
    }

    if (rawCategory && rawCategory.length) {
      const [{ _: categoryText }] = rawCategory;
      category = categoryText;
    }

    return {
      title, description, link,
      guid, summary, ...{ category },
      pubDate: this.formatDate(pubDate),
      article, ...media
    };
  }
}
