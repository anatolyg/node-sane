/**
 * User: anatoly
 * Date: 10/9/11
 * Time: 1:35 AM
 */

var GScan = {
    outputDir: "./public/scans/",
    scannerScript: "./scripts/scan-adf.sh",
    webDir: "/scans/",
    lib: require('./lib')
};

var cradle = require('cradle'),
    db = new(cradle.Connection)().database('node-scan'),
    sys = require('sys'),
    fs = require('fs'),
    exec = require('child_process').exec;

exports.index = function (req, res) {
    db.view('all_scans/all_scans', function (err, docs) {
        res.render('index.ejs', {
            title: "Need to scan something?",
            docs: docs,
            msg: req.flash()
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
        scan: req.gscan.scan,
        msg: req.flash()
    });
};

exports.remove = function(req, res) {
    db.remove(req.gscan.scan.doc_id, req.gscan.scan._rev, function(err, response) {
        if (!err) {
            var child = exec(["rm -rf", GScan.outputDir + req.gscan.scan.doc_id].join(" "), function (error, stdout, stderr) {
                req.flash("info", ["Document", "'", req.gscan.scan.name, "'", "was deleted"].join(" "));
                res.redirect("/");
            });
        }
        else {
            console.error(err);
        }
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
                        db.save(docId, {
                            link: link,
                            timestamp: (new Date()).getTime(),
                            name: name,
                            description: desc,
                            doc_id: docId,
                            keywords: keywords.replace(/\ /,'').split(",")
                        }, function (err, res) {
                            if (err) {
                                console.error("could not save document", docId, err);
                            } else {
                                // Handle success
                            }
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
            msg: req.flash()
        });
    }
    else {
        db.view('all_scans/all_scans', function (err, docs) {
            res.render('index.ejs', {
                title: "Need to scan something?",
                error: "please enter something for name and description, so you can find it later",
                docs: docs,
                msg: req.flash()
            });
        });
    }
};