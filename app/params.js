/**
 * User: anatoly
 * Date: 10/9/11
 * Time: 1:37 AM
 */

var cradle = require('cradle'),
    db = new(cradle.Connection)().database('node-scan');

// Params
exports.params = {
    scanId:  function(req, res, next, id){
        db.get(id, function(err, res) {
            req.gscan = req.gscan || {};
            if (!err) {
                req.gscan.scan = res;
            }
            if (!req.gscan.scan && res) {
                res.send(404);
            }
            else {
                next();
            }
        });
    },
    
    keyword: function(req, res, next, id){
        db.view('all_scans/keyword', function (err, docs) {
            res.render('index.ejs', {
                title: "Need to scan something?",
                error: "please enter something for name and description, so you can find it later",
                docs: docs,
                msg: req.flash()
            });
        });

        db.get(id, function(err, res) {
            req.gscan = req.gscan || {};
            if (!err) {
                req.gscan.scan = res;
            }
            if (!req.gscan.scan && res) {
                res.send(404);
            }
            else {
                next();
            }
        });
    }
};