/**
 * RSS2.0 type definitions as cited in https://cyber.harvard.edu/rss/rss.html
 */
declare module RSS {
  /**
   * Category
   */
  type CategoryMetadata = { domain?: string };
  export type Category = XML.TextWithMetadata<string, CategoryMetadata>;

  /**
   * Enclosure
   */
  type EnclosureMetadata = {
    url: string;
    length: string;
    type: string;
  };
  export type Enclosure = XML.WithMetadata<EnclosureMetadata>;

  /**
   * Guid
   */
  type GuidMetadata = { isPermaLink?: string };
  export type Guid = XML.TextWithMetadata<string, GuidMetadata>;

  /**
   * Source
   */
  type SourceMetadata = { url: string };
  export type Source = XML.TextWithMetadata<string, SourceMetadata>;
  
  /**
   * Item
   */
  type ItemContent = {
    title: string;
    link?: string;
    description?: string;
    author?: string;
    category?: Category;
    comments?: string;
    enclosure?: Enclosure;
    guid?: Guid;
    pubDate?: string;
    source?: Source;
  }
  export type Item = XML.WithContent<ItemContent>

  /**
   * Image
   */
  type ImageContent = {
    url: string;
    title: string;
    link: string;
    width?: string;
    height?: string;
    description?: string;
  }
  export type Image = XML.WithContent<ImageContent>

  /**
   * Cloud
   */
  type CloudMetadata = {
    domain: string;
    port: string;
    path: string;
    registerProcedure: string;
    protocol: string;
  }
  export type Cloud = XML.WithMetadata<CloudMetadata>;

  /**
   * TextInput
   */
  type TextInputContent = {
    title: string;
    description: string;
    name: string;
    link: string;
  }
  export type TextInput = XML.WithContent<TextInputContent>;

  /**
   * Channel
   */
  type ChannelContent = {
    title: string;
    link: string;
    description: string;
    item?: Item;
    language?: string;
    copyright?: string;
    managingEditor?: string;
    webMaster?: string;
    pubDate?: string;
    lastBuildDate?: string;
    category?: Category;
    generator?: string;
    docs?: string;
    cloud?: Cloud;
    ttl?: string;
    image?: Image;
    rating?: string;
    textInput?: TextInput;
    skipHours?: string;
    skipDays?: string;
  }
  export type Channel = XML.WithContent<ChannelContent>;
  
  /**
   * Feed
   */
  type FeedMetadata = {
    version: string;
  };
  type FeedContent = {
    channel: Channel
  };
  export type Feed = XML.ContentWithMetadata<FeedContent, FeedMetadata>;
}
