import { XML } from './xml';
import { RSS } from './rss';

export module RSSExtras {
  /**
   * Media
   */
  export type MediaContentMetadata = {
    description: string;
    url: string;
  };
  export type MediaContentContent = {
    'media:description': string;
  };
  export type MediaContent = {
    'media:content': XML.ContentWithMetadata<MediaContentContent, MediaContentMetadata>
  };
  export type Media = XML.WithContent<MediaContent>;
  export type ItemWithMedia = XML.WithContent<RSS.ItemContent & MediaContent>;

  /**
   * Atom10
   */
  export type Atom10LinkMetadata = {
    href: string;
    rel: string;
    type: string;
    'xmlns:atom10': string;
  };
  export type Atom10Content = {
    'atom10:link': XML.WithMetadata<Atom10LinkMetadata>;
  }
  export type Atom10 = XML.WithContent<Atom10Content>;
  export type ChannelWithAtom10 = XML.WithContent<RSS.ChannelContent & Atom10Content>;

  /**
   * Feedburner
   */
  export type FeedburnerInfoMetadata = {
    uri: string;
    'xmlns:feedburner': string;
  }
  export type FeedburnerContent = {
    'feedburner:info': XML.WithMetadata<FeedburnerInfoMetadata>;
  }
  export type Feedburner = XML.WithContent<FeedburnerContent>;
  export type ChannelWithFeedburner = XML.WithContent<RSS.ChannelContent & FeedburnerContent>;
}
