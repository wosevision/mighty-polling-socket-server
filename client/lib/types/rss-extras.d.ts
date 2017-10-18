declare module RSS {
  /**
   * Media
   */
  type MediaDescription = {
    'media:description': string;
  };
  type MediaMetadata = {
    description: string;
    url: string;
  };
  type MediaContent = {
    'media:content': XML.ContentWithMetadata<MediaDescription, MediaMetadata>
  };
  export type Media = XML.WithContent<MediaContent>;
  export type ItemWithMedia = Item & Media;

  /**
   * Atom10
   */
  export type Atom10Metadata = {
    href: string;
    rel: string;
    type: string;
    [xmlns?: string]: string;
  }
  export type Atom10 = {
    ['atom10:link']: XML.WithMetadata<Atom10Metadata>;
  }
  export type ChannelContentWithAtom10 = ChannelContent & Atom10;

  /**
   * Feedburner
   */
  export type FeedburnerMetadata = {
    uri: string;
    [xmlns?: string]: string;
  }
  export type Feedburner = {
    ['feedburner:info']: XML.WithMetadata<FeedburnerMetadata>;
  }
  export type ChannelContentWithFeedburner = ChannelContent & Feedburner;

  /**
   * Channel
   */
  export type Channel = XML.WithContent<ChannelContent | ChannelContentWithAtom10 | ChannelContentWithFeedburner>;
}
