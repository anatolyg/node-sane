
/**
 * Module dependencies.
 */

var express = require('express');
var redis = require('redis');
var sys = require('sys');
var fs = require('fs');
var exec = require('child_process').exec;

var app = module.exports = express.createServer();

// Configuration

var procs = [];

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
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

function uuid(a){
    return a?(0|Math.random()*16).toString(16):(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,uuid)
}


// Routes

app.get('/', function(req, res){
    res.render('index.ejs', {
        title: 'Need to scan somethings?'
    });
});

app.post('/scan/', function(req, res) {
    var name = req.param("name"),
        desc = req.param("desc"),
        docId = uuid();

    // name and desc are valid
    if (name && desc) {
        // let's create an ID to call this guy
        var dirName = './scans/' + docId;
        fs.mkdir(dirName, 0755, function(err) {
            if (!err) {
                // call successful
                console.log("success!")
                var child = exec("./scripts/scan-adf.sh " + dirName + " " + docId, function (error, stdout, stderr) {
                    sys.print('stdout: ' + stdout);
                    sys.print('stderr: ' + stderr);
                    if (error !== null) {
                        fs.rmdir(dirName, function(err) {
                            console.log("deleted dir: " + dirName);
                        });
                    }
                    else {
                        console.log("All good!");
                    }
                });
                
            }
            else {

            }
        });
        
    }

    res.render('scan.ejs', {
        title: 'Thanks for scanning, your file is ' + docId + '.pdf'
    });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
