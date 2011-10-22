/**
 * User: anatoly
 * Date: 10/9/11
 * Time: 1:35 AM
 */

var GScan = require('./GScan').GScan,
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
    client.collection(GScan.db.collections.scans, function(err, collection) {
        collection.find(searchParams, searchProps).toArray(function(err, docs) {
            res.render('index.ejs', {
                title: "Need to scan something?",
                locals: {
                    docs: docs
                }
            });
            client.close();
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
    if (!client) {
        res.send(500);
        console.error(err, client);
        return;
    }
    client.collection(GScan.db.collections.scan, function(err, collection) {
        collection.remove({
            doc_id: req.gscan.scan.doc_id
        }, function(err) {
            var child = exec(["rm -rf", GScan.outputDir + req.gscan.scan.doc_id].join(" "), function (error, stdout, stderr) {
                req.flash("info", ["Document", "'", req.gscan.scan.name, "'", "was deleted"].join(" "));
                res.redirect("/");
            });
            client.close();
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
        var dirName = GScan.outputDir + docId;

        fs.mkdir(dirName, 0755, function(err) {
            if (!err) {
                // directory created successfully, let's scan
                var child = exec([GScan.scannerScript, dirName, docId].join(" "), function (error, stdout, stderr) {
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
                        link = [GScan.webDir, docId, "/", docId,".pdf"].join("");
                        title = 'Thanks for scanning!';
                        // put the following into storage, as well as on disk next to PDF
                        client.collection(GScan.db.collections.scans, function(err, collection) {
                            collection.insert({
                                'link': link,
                                'timestamp': (new Date()).getTime(),
                                'name': name,
                                'description': desc,
                                'doc_id': docId,
                                'keywords': keywords.replace(/\ /gi,'').split(",")
                            }, function(err, docs) {
                                console.log(err, docs);
                            });
                            client.close();
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