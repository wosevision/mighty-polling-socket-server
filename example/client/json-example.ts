export const TYPE_JSON = 'json-example';
export type TYPE_JSON = typeof TYPE_JSON;

export type JSONExampleItem = {
  title?: string;
  link?: string;
  description: string;
  pubDate: string;
  guid: string;
};
