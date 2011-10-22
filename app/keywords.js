/**
 * User: anatoly
 * Date: 10/9/11
 * Time: 1:38 AM
 */

exports.index = function (req, res) {
    if (req.gscan && req.gscan.scan) {
        res.render('index.ejs', {
            title: "Documents matching tag " + req.param("keyword"),
            locals: {
                docs: req.gscan.scan
            }
        });
    }
};