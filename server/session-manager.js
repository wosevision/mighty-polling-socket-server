const SESSION_SECRET = 'it\'s a beautiful day in the neigh-bor-hood!'

class SessionManager {
  constructor(app, params, logger) {
    app.use(params.sessionStore || require('express-session')({
      secret: SESSION_SECRET
    }));
    logger.log('session', 'manager started');
  }
}

exports.SessionManager = SessionManager;