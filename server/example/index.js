const { PollingSocketServer } = require('../lib/polling-socket-server');
const { SOURCE_LIST } = require('./sources');

const pss = new PollingSocketServer();

pss.sources(SOURCE_LIST);
pss.broadcast(8080);
