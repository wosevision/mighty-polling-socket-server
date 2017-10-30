import { RSS, RSSExtras } from '../lib';

const item: RSS.Item = {
  title: ['']
};

const media: RSSExtras.Media  = {
  'media:content': [{
      $: {
        description: '',
        url: ''
      },
      'media:description': ['']
  }]
};

const itemWithMedia: RSSExtras.ItemWithMedia = {
  title: [''],
  ...media
};

const category: RSS.Category = {
  $: {
    domain: ''
  },
  _: ''
};

const channel: RSS.Channel = {
  title: [''],
  link: [''],
  description: [''],
  item: [item, itemWithMedia],
  category: [category]
};

const rss: RSS.Feed = {
  $: {
    version: ''
  },
  channel: [channel],
};

export default rss;