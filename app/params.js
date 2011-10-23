/**
 * User: anatoly
 * Date: 10/9/11
 * Time: 1:37 AM
 */

var GScan = new (require('./GScan').GScan)();

// Params
exports.params = {
    scan:  function(req, res, next, id){
        GScan.db.collection(GScan.config.db.collections.scans, function(err, collection) {
            collection.findOne({doc_id: id}, function(err, doc) {
                req.gscan = req.gscan || {};
                if (!err) {
                    req.gscan.scan = doc;
                }
                if (!req.gscan.scan && doc) {
                    res.send(404);
                }
                else {
                    next();
                }
            });
        });
    },
    
    keyword: function(req, res, next, id){
        GScan.db.collection(GScan.config.db.collections.scans, function(err, collection) {
            collection.find({keywords: id}).toArray(function(err, docs) {
                req.gscan = req.gscan || {};
                if (!err) {
                    req.gscan.scan = docs;
                }
                if (!req.gscan.scan && docs) {
                    res.send(404);
                }
                else {
                    next();
                }
            });
        });
    }
};