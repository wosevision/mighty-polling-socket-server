declare module RSS {
  declare namespace Extras {
    /**
     * Media
     */
    type MediaContentMetadata = {
      description: string;
      url: string;
    };
    type MediaContentContent = {
      'media:description': string;
    };
    type MediaContent = {
      'media:content': XML.ContentWithMetadata<MediaContentContent, MediaContentMetadata>
    };
    export type Media = XML.WithContent<MediaContent>;
    export type ItemWithMedia = XML.WithContent<ItemContent & MediaContent>;

    /**
     * Atom10
     */
    type Atom10LinkMetadata = {
      href: string;
      rel: string;
      type: string;
      'xmlns:atom10': string;
    };
    type Atom10Content = {
      'atom10:link': XML.WithMetadata<Atom10LinkMetadata>;
    }
    export type Atom10 = XML.WithContent<Atom10Content>;
    export type ChannelWithAtom10 = XML.WithContent<ChannelContent & Atom10Content>;

    /**
     * Feedburner
     */
    type FeedburnerInfoMetadata = {
      uri: string;
      'xmlns:feedburner': string;
    }
    type FeedburnerContent = {
      'feedburner:info': XML.WithMetadata<FeedburnerInfoMetadata>;
    }
    export type Feedburner = XML.WithContent<FeedburnerContent>;
    export type ChannelWithFeedburner = XML.WithContent<ChannelContent & FeedburnerContent>;
  }
}
