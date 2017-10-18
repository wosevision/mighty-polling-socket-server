declare module RSS {
  
  type CategoryMetadata = { domain: string };
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
   * Item
   */
  type ItemContent = {
    title: string;
    link?: string;
    description?: string;
    author?: string;
    category?: string;
    comments?: string;
    enclosure?: Enclosure;
    guid?: string;
    pubDate?: string;
    source?: string;
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

  type CloudMetadata = {
    domain: string;
    port: string;
    path: string;
    registerProcedure: string;
    protocol: string;
  }
  export type Cloud = XML.WithMetadata<CloudMetadata>;

  type TextInputContent = {
    title: string;
    description: string;
    name: string;
    link: string;
  }
  export type TextInput = XML.WithContent<TextInputContent>;

  export interface ChannelContent {
    title: string;
    link: string;
    description: string;
    item?: Item | ItemWithMedia;
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
  

  export interface FeedContent {
    channel: Channel
  };
  export interface FeedMetadata {
    version: string;
    [xmlns?: string]: string; 
  };
  export type Feed = XML.ContentWithMetadata<FeedContent, FeedMetadata>;
}
