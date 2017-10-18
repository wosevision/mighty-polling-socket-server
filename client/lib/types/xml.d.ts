declare module XML {
  /** Add metadata to node under `$` property. */
  export type WithMetadata<M> = {
    $: M;
  }
  /** Add text content under `_` property. */
  export type WithText<C extends string> = {
    _: C;
  }
  /** Convert object's properties to array values. */
  export type WithContent<C> = {
    [K in keyof C]: C[K][];
  }
  /**
   * Join text and metadata into single node
   * @example
   * type M = { prop: number };
   * type T = string;
   * const mt: TextWithMetadata<T, M> = {
   *   $: { prop: 123 }
   *   _: 'things'
   * }
   */
  export type TextWithMetadata<T, M> = WithText<T> & WithMetadata<M>;
  /**
   * Join content and metadata into single node.
   * @example
   * type M = { prop: number };
   * type C = { stuff: string };
   * const mc: ContentWithMetadata<C, M> = {
   *   $: { prop: 123 }
   *   stuff: ['things']
   * }
   */
  export type ContentWithMetadata<C, M> = WithContent<C> & WithMetadata<M>;
}
