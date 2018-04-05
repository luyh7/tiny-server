// 引用 express 来支持 HTTP Server 的实现
const express = require('express');
const userlogin = require('./controller/userlogin.js');
const confirmPay = require('./controller/confirmpay.js')
const consumerPay = require('./controller/consumerpay.js')
const doWXPay = require('./controller/dowxpay.js')
const doAliPay = require('./controller/doalipay.js')
const notifyMerchant = require('./controller/notifymerchant')
const getIncome = require('./controller/getincome')
// 创建一个 express 实
const app = express();

var bodyParser = require('body-parser');  

// parse application/x-www-form-urlencoded  
app.use(bodyParser.urlencoded({ extended: false }))  

// parse application/json  
app.use(bodyParser.json())  

const path = require('path');
app.use(express.static(path.join(__dirname, 'views')));

app.post('/userlogin', userlogin.post);
app.post('/confirmpay', confirmPay.post);
app.post('/dowxpay', doWXPay.post);
app.post('/doalipay', doAliPay.post);
app.post('/getincome', getIncome.post);

app.get('/consumerpay',consumerPay.get)
app.get('/notifymerchant',notifyMerchant.get)

app.get('/test', function(req, res) {
    console.log(req.query);
});

// 实现唯一的一个中间件，对于所有请求，都输出 "Response from express"
app.use((request, response, next) => {
   console.log("allreq: " + request);
    response.end();
});

// 监听端口，等待连接
const port = 2333;
app.listen(port);

// 输出服务器启动日志
console.log(`Server listening at http://127.0.0.1:${port}`);

module.exports = app;
