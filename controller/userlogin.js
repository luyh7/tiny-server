
function post(req, res, next) {
  //console.log(req);
  console.log(req.body);
  console.log(req.query);

  if('abc' == req.body.username && '123123' == req.body.password){
    res.json({ code: 1})
  }
  next();
}

module.exports ={'post': post};
