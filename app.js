
/**
 * Module dependencies.
 */

var express = require('express');
/*
var redis = require('redis'),
    redis_client = redis.createClient(null, '192.168.1.111');
*/
var sys = require('sys');
var fs = require('fs');
var exec = require('child_process').exec;

var cradle = require('cradle')
var db = new(cradle.Connection)().database('node-scan');

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
    db.view('all_scans/all_scans', function (err, docs) {
        console.log(docs);
        res.render('index.ejs', {
            title: "Need to scan something?",
            docs: docs
        });
    });
});

app.post('/scan/', function(req, res) {
    var name = req.param("name"),
        desc = req.param("desc"),
        keywords = req.param("keywords"),
        docId = uuid(),
        link = "",
        title = "";

    // name and desc are valid
    if (name && desc) {
        // let's create an ID to call this guy
        var dirName = './scans/' + docId;
        
        fs.mkdir(dirName, 0755, function(err) {
            if (!err) {
                // directory created successfully, let's scan
                var child = exec("./scripts/scan-adf.sh " + dirName + " " + docId, function (error, stdout, stderr) {
                    sys.print('stdout: ' + stdout);
                    sys.print('stderr: ' + stderr);
                    if (error !== null) {
                        fs.rmdir(dirName, function(err) {
                            console.log("deleted dir: " + dirName);
                            title = "Scan failed " + stderr;
                        });
                        db.save("error:" + docId, {
                            out: stdout,
                            err: stderr,
                            error: error
                        }, function(err, res) {});
                    }
                    else {
                        // this is where partial comes in?
                        console.log("All good!");
                        link = "/scans/" + docId + "/" + docId + ".pdf";
                        title = 'Thanks for scanning!';
                        // put the following into storage, as well as on disk next to PDF
                        db.save(docId, {
                            link: link,
                            timestamp: (new Date()).getTime(),
                            name: name,
                            description: desc,
                            doc_id: docId,
                            keywords: keywords
                        }, function (err, res) {
                            if (err) {
                                console.log("could not save document", docId, err);
                            } else {
                                // Handle success
                            }
                        });
                    }
                });
            }
            else {
                console.log("Could not create dir", dirName);
            }
        });
        res.render('scan.ejs', {
            title: title
        });
    }
    else {
        db.view('all_scans/all_scans', function (err, docs) {
            console.log(docs);
            res.render('index.ejs', {
                title: "Need to scan something?",
                error: "please enter something for name and description, so you can find it later",
                docs: docs
            });
        });
    }
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
