/**
 * Constants for holding source type references.
 */
const TYPE_DISRUPTION = 'disruption';
const TYPE_EMERGENCY = 'emergency';
const TYPE_WEATHER = 'weather';

const SOURCE_LIST = [
  {
    type: 'example',
    url: 'http://localhost:3000/server/example/xml/rss_example.xml',
    compare: (
      { rss: { channel: [{ item: [{ pubDate: [oldData] }] }] } },
      { rss: { channel: [{ item: [{ pubDate: [newData] }] }] } },
    ) => oldData === newData,
    xml: true
  },
  // {
  //   type: TYPE_DISRUPTION,
  //   url: 'http://localhost:3000/server/example/xml/service_disruptions.xml',
  //   compare: (
  //     { rss: { channel: [{ pubDate: [oldData] }] } },
  //     { rss: { channel: [{ pubDate: [newData] }] } }
  //   ) => oldData === newData,
  //   xml: true
  // },
  // {
  //   type: TYPE_EMERGENCY,
  //   url: 'http://localhost:3000/server/example/xml/emergency_messages.xml',
  //   compare: (
  //     { rss: { channel: [{ item: [{ pubDate: [oldData] }] }] } },
  //     { rss: { channel: [{ item: [{ pubDate: [newData] }] }] } },
  //   ) => oldData === newData,
  //   interval: 5000,
  //   xml: true
  // },
  // {
  //   type: TYPE_WEATHER,
  //   url: 'http://rss.blackboardconnect.com/182195/uoitclosure/feed.xml'
  // }
]

exports = module.exports = { SOURCE_LIST, TYPE_DISRUPTION, TYPE_EMERGENCY, TYPE_WEATHER };