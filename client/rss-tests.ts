const item: RSS.Item = {
  title: ['']
};

const media: RSS.Extras.Media  = {
  'media:content': [{
      $: {
        description: '',
        url: ''
      },
      'media:description': ['']
  }]
};

const itemWithMedia: RSS.Extras.ItemWithMedia = {
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