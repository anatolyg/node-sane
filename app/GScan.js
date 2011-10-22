/**
 * Created by JetBrains WebStorm.
 * User: anatoly
 * Date: 10/16/11
 * Time: 12:23 PM
 * To change this template use File | Settings | File Templates.
 */

exports.GScan = {
    outputDir: "./public/scans/",
    scannerScript: "./scripts/scan-adf.sh",
    webDir: "/scans/",
    lib: require('./lib'),
    db: {
        name: "nodescan",
        collections: {
            scans: "scans"
        }
    }
};