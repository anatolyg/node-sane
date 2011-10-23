/**
 * User: anatoly
 * Date: 10/9/11
 * Time: 1:35 AM
 */

var GScan = new (require('./GScan').GScan)(),
    sys = require('sys'),
    fs = require('fs'),
    exec = require('child_process').exec;

exports.index = function (req, res) {
    var searchParams = {};
    var searchProps = {limit:10};
    if (req.param("search")) {
        var criteria = req.param("search");
        searchParams = {
            $or : [
                { name : new RegExp(criteria,"gi") },
                { keywords : criteria },
                { description : new RegExp(criteria,"gi")}
            ]
        };
        searchProps = {};
    }
    GScan.db.collection(GScan.config.db.collections.scans, function(err, collection) {
        collection.find(searchParams, searchProps).toArray(function(err, docs) {
            if (req.param("search") && docs.length === 0) {
                req.flash("info", "Your query returned 0 results");
            }
            res.render('index.ejs', {
                title: "Need to scan something?",
                locals: {
                    docs: docs
                }
            });
        });
    });
};

exports.view = function(req, res) {
    if (!req.gscan.scan && res) {
        res.send(404);
        return;
    }
    
    res.render("scan_properties.ejs", {
        title: ((req.gscan.scan) ? req.gscan.scan.name : "NA"),
        locals: {
            scan: req.gscan.scan
        }
    });
};

exports.remove = function(req, res) {
    if (!GScan.db) {
        res.send(500);
        console.error(err, GScan.db);
        return;
    }
    GScan.db.collection(GScan.config.db.collections.scans, function(err, collection) {
        collection.remove({
            doc_id: req.gscan.scan.doc_id
        }, function(err) {
            var child = exec(["rm -rf", GScan.config.outputDir + req.gscan.scan.doc_id].join(" "), function (error, stdout, stderr) {
                req.flash("info", ["Document", "'", req.gscan.scan.name, "'", "was deleted"].join(" "));
                res.redirect("/");
            });
        });
    });
};

exports.create = function(req, res) {
    var name = req.param("name"),
        desc = req.param("desc"),
        keywords = req.param("keywords"),
        docId = GScan.lib.uuid(),
        link = "",
        title = "";

    // name and desc are valid
    if (name && desc) {
        // let's create an ID to call this guy
        var dirName = GScan.config.outputDir + docId;

        fs.mkdir(dirName, 0755, function(err) {
            if (!err) {
                // directory created successfully, let's scan
                var child = exec([GScan.config.scannerScript, dirName, docId].join(" "), function (error, stdout, stderr) {
                    sys.print('stdout: ' + stdout);
                    sys.print('stderr: ' + stderr);
                    if (error !== null) {
                        fs.rmdir(dirName, function(err) {
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
                        link = [GScan.config.webDir, docId, "/", docId,".pdf"].join("");
                        title = 'Thanks for scanning!';
                        // put the following into storage, as well as on disk next to PDF
                        GScan.db.collection(GScan.config.db.collections.scans, function(err, collection) {
                            collection.insert({
                                'link': link,
                                'timestamp': (new Date()).getTime(),
                                'name': name,
                                'description': desc,
                                'doc_id': docId,
                                'keywords': keywords.split(/[\s,]+/)
                            }, function(err, docs) {
                                console.log(err, docs);
                            });
                        });
                    }
                });
            }
            else {
                console.error("Could not create dir", dirName);
            }
        });
        res.render('scan.ejs', {
            title: title,
            locals: {}
        });
    }
    else {
        res.redirect("/");
    }
};