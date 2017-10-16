const { PollingSocketServer } = require('../lib/polling-socket-server');
const { SOURCE_LIST } = require('./sources');

const pss = new PollingSocketServer({
  defaultInterval: 2000,
  checkHeartbeat: true
});

pss.sources(SOURCE_LIST);
pss.broadcast(8080);
