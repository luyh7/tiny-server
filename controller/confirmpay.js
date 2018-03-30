var debug = require('debug')('confirmpay');
function post(req, res, next) {
    //console.log(req);
    console.log(req.body);
    debug(req.body);
    res.json({code: 233});
    next();
}

module.exports ={'post': post};
