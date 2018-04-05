var network = require('../utlis/network')
function post(req, res, next) {
    //console.log(req);
    console.log('\ngetincome: ' + network.income);
    res.json({code: 1, income: network.income});
    next();
}

module.exports ={'post': post};
