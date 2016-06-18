#!/usr/bin/env node
var config = require('./config.js')();
var telegram = require('./telegram.js')(config);
var db = require('./db.js')(config);
var expressApp = require('./expressApp.js')(db, telegram, config);
expressApp.run();
