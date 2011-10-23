/**
 * Created by JetBrains WebStorm.
 * User: anatoly
 * Date: 10/16/11
 * Time: 12:23 PM
 * To change this template use File | Settings | File Templates.
 */
var Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

exports.GScan = function() {
    this.outputDir = "./public/scans/";
    this.scannerScript = "./scripts/scan-adf.sh";
    this.webDir = "/scans/";
    this.lib = require('./lib');
    this.config = {
        db: {
            name: "nodescan",
            collections: {
                scans: "scans"
            },
            host: 'localhost',
            port: 27017
        }
    };
    this.db = new Db(this.config.db.name, new Server(this.config.db.host, this.config.db.port, {}), {});

    (function(scope) {
        scope.db.open(function(err, db) {});
    })(this);

    return {
        db: this.db,
        lib: this.lib,
        config: {
            outputDir: this.outputDir,
            scannerScript: this.scannerScript,
            webDir: this.webDir,
            db: this.config.db
        }
    };
}