import { XML } from './xml';
import { RSS } from './rss';
export declare module RSSExtras {
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
        'media:content': XML.ContentWithMetadata<MediaContentContent, MediaContentMetadata>;
    };
    type Media = XML.WithContent<MediaContent>;
    type ItemWithMedia = XML.WithContent<RSS.ItemContent & MediaContent>;
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
    };
    type Atom10 = XML.WithContent<Atom10Content>;
    type ChannelWithAtom10 = XML.WithContent<RSS.ChannelContent & Atom10Content>;
    /**
     * Feedburner
     */
    type FeedburnerInfoMetadata = {
        uri: string;
        'xmlns:feedburner': string;
    };
    type FeedburnerContent = {
        'feedburner:info': XML.WithMetadata<FeedburnerInfoMetadata>;
    };
    type Feedburner = XML.WithContent<FeedburnerContent>;
    type ChannelWithFeedburner = XML.WithContent<RSS.ChannelContent & FeedburnerContent>;
}
