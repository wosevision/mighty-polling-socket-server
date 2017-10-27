/**
 * Utilities for providing simple structured interfaces
 * for complex XML data structures.
 * 
 * XML can have elements (`Content`), that can have attributes
 * (`Metadata`), and can contain text nodes (`Text`) or other
 * elements. 
 * 
 * These interfaces allow you to write interface types for specific
 * nodes that conform to `xml2js` transformation rules.
 * 
 * @example
 * type TestText = 'things';
 * type TestContentNested = { nestedContent: 'things' };
 * type TestContent = { content: TestContentNested, moreContent: 'things' };
 * type TestMetadata = { property: 'things' };
 * 
 * const c: WithContent<TestContentNested> = {
 *   nestedContent: ['things']
 * }
 * 
 * const tc: TextWithContent<TestText, TestContent> = {
 *   _: 'things',
 *   content: [c],
 *   moreContent: ['things']
 * }
 * 
 * const tm: TextWithMetadata<TestText, TestMetadata> = {
 *   $: { property: 'things' },
 *   _: 'things'
 * }
 * 
 * const cm: ContentWithMetadata<C, M> = {
 *   $: { property: 'things' },
 *   content: [c],
 *   moreContent: ['things']
 * }
 * 
 * const cm: TextWithContentAndMetadata<C, M> = {
 *   $: { property: 'things' },
 *   _: 'things',
 *   content: [c],
 *   moreContent: ['things']
 * }
 */
declare module XML {
  /**
   * Add metadata to node under `$` property.
   */
  export interface WithMetadata<M> {
    $: M;
  }
  /**
   * Add text content under `_` property.
   */
  export interface WithText<T extends string> {
    _: T;
  }
  /** 
   * Convert object's properties to array values.
   */
  export type WithContent<C> = {
    [K in keyof C]: C[K][];
  }

  /**
   * Join text and metadata into single node
   */
  export type TextWithMetadata<T, M> = WithText<T> & WithMetadata<M>;
  /**
   * Join text and content into single node
   */
  export type TextWithContent<T, C> = WithText<T> & WithContent<C>;
  /**
   * Join content and metadata into single node.
   */
  export type ContentWithMetadata<C, M> = WithContent<C> & WithMetadata<M>;
  /**
   * Join content, text and metadata into single node.
   */
  export type TextWithContentAndMetadata<T, C, M> = WithText<T> & WithContent<C> & WithMetadata<M>;
}
