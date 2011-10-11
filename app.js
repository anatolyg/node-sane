
/**
 * Module dependencies.
 */

var express = require('express'),
/*
    redis = require('redis'),
    redis_client = redis.createClient(null, '192.168.1.111'),
*/
    sys = require('sys'),
    MemoryStore = express.session.MemoryStore;

var app = module.exports = express.createServer();

var scan = require('./app/scan'),
    lib = require('./app/lib'),
    keywords = require('./app/keywords'),
    params = require('./app/params');

for (var param in params.params) {
    app.param(param, params.params[param]);
}

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: "my super secret session key",
        store: new MemoryStore({ reapInterval: 60000 * 10 })
    }));
    app.use(require('stylus').middleware({ src: __dirname + '/public' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Routes
app.get('/', scan.index);
app.get('/scan/keyword/:keyword', keywords.index);
app.get('/scan/:scanId', scan.view);
app.post('/scan/', scan.create);
app.get("/scan/:scanId/delete", scan.remove);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);