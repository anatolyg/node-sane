
/**
 * Module dependencies.
 */

var express = require('express'),
    sys = require('sys'),
    MemoryStore = express.session.MemoryStore,
    GScan = require('./app/GScan').GScan,
    mongoose = require('mongoose'),
    client = mongoose.connect('mongodb://localhost/nodescan')

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
    app.set('client', client);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

app.dynamicHelpers({
    flash: function(req, res){
        return req.flash();
    }
});

// open mongo connection

// Routes
app.get('/', scan.index);

app.post('/scan/', scan.create);
app.get('/scan/:scan', scan.view);
app.get("/scan/:scan/delete", scan.remove);

app.get('/keyword/:keyword', keywords.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);