
//废弃
var debug = require('debug')('confirmpay');
function get(req, res, next) {
    //console.log(req);
    console.log(req.body);
    console.log(req.query);
    debug(req.body);
    debug(req.query);
    res.sendFile(__dirname + '/../views/consumerPay.html')
    next();
}

module.exports ={'get': get};
