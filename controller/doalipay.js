//request需要做一层封装，不然代码不够优雅
var request = require('request')
var path = require('path');
var fs = require('fs');


//本服务器域名，从config取
const host = 'http://111.230.51.46:2333';

var NodeRSA = require('node-rsa');

var staticSign1 = "mPnqSwWH18lS8n8MNBYrI498D6855jHCMssGjU6uEZqP/CZdsW+HkXXP50eMmB3Cz/CL8flqeI6K6gpXRroxqGELBL25fObi2jnZmylrfdGQm4EGeQn9z2mL1dJdLvDpnmEqgCUPwDvKeEwERU0N0Znx4O0ylY+gyFHFWHFjQ5KmbWMsM2D0MSLFFKAO0On1nwzYJz56GNTlK+DwX67gA5VklflyT56/nBKOeE2LTka7tEX+W2T96EKwwK0pgk7Qb7DwbBamPvftlZD9NXj6LfdqnBsz8eizXhKulkSUGLpjYZEm0JUIZJTHeA2jf0+WEHCIBSTB9z7V993CrMX7yQ==";
staticSign1 = new Buffer(staticSign1).toString('base64');
const staticSign2 = '';
//下单接口
function post(req, res, next) {
    console.log('doalipay: ' + req.toString());
    getUserid(req.body, res);
    // next();
}

/**
 * 通过code获取用户openid
 * @param {*} body 前端传来的数据
 * @param {*} res 返回消息给前端的句柄，这个考虑要不要作为全局变量
 */
function getUserid(body, res){
    var data = {};
    var userPayInfo = {};

    userPayInfo['total_fee'] = body.total_fee;


    data = initData();

    data['method'] = 'alipay.system.oauth.token';

    // 授权码，用户对应用授权后得到
    data['code'] = body.code;
    // 默认
    data['grant_type'] = 'authorization_code';

    // 签名 放在最后
    data['sign'] = getSign(data);
    // data['sign'] = staticSign1;
    var url = 'https://openapi.alipaydev.com/gateway.do';
    url = formatUrl(url, data);
    console.log("getUserIdUrl: " + url +'\n');
    //获取用户openid
    request.get(
        url, 
        function (error, response, body) {  
            if (!error && response.statusCode == 200) {
                console.log("res in getUserid" + body);
                //支付宝下单
                placeOrder(userPayInfo, JSON.parse(body), res);
            } else{
                console.log('err in getUserid: ' +  error);
            }
    })
}

/**
 * 成功获取userid后，进行交易创建操作
 * @param {*} userPayInfo 从前端获取的支付数据
 * @param {*} body 从支付宝接口获取userid返回的数据
 * @param {*} res 返回消息给前端的句柄
 */
function placeOrder(userPayInfo, body, res){
    var data = {};
    //
    data = initData();

    data['method'] = 'alipay.trade.create';
    // 支付成功后的通知接口
    data['notify_url'] = `${host}/notifymerchant`;

    // data['app_auth_token'] = body.access_token;
    var biz_content = {};
    // 商户订单号
    biz_content['out_trade_no'] = '0001';
    // 订单总金额，单位为元，精确到小数点后两位
    biz_content['total_amount'] = parseFloat(userPayInfo.total_fee) / 100;
    // 订单标题
    biz_content['subject'] = 'UserPay';
    // 支付的用户userid
    console.log('\nbody: ' + body);
    console.log('\nuser_id: ' + body.alipay_system_oauth_token_response);
    biz_content['buyer_id'] = body.alipay_system_oauth_token_response.alipay_user_id;

    data['biz_content'] = formatBiz(biz_content);

    data['sign'] = getSign(data);
    // data['sign'] = staticSign2;
    var url = '	https://openapi.alipaydev.com/gateway.do';
    url = formatUrl(url, data);
    console.log("placeOrderUrl: " + url +'\n');
    //更新数据库 todo

    //请求统一下单api
    request.get(
        url, 
        function (error, response, body) {  
            if (!error && response.statusCode == 200) {
                console.log("res in placeOrder" + body);
                // 下单完成之后通知前端
                callbackClient(JSON.parse(body), res);
            } else{
                console.log('err in placeOrder: ' +  error);
            }
    })
}

function callbackClient(body, res){
    //下单成功
    data = {};
    ali_response = body.alipay_trade_create_response;
    if(ali_response.code == '10000'){
        
        // 支付宝订单号，前端利用这个调起支付页面
        data['trade_no'] = ali_response.trade_no;

        //传给前端的成功标识，这个要用静态类封装 todo
        data['status'] = 'success';

        //验签失败，不能继续支付
        if(!checkSign(ali_response,body.sign)){
            data['status'] = 'fail';
        }
    }
    // 下单失败
    else{
        console.log(`err-createOrder: ${body}`);
        data['status'] = 'fail';
    }

    //告诉前端下单结果
    res.json(data);
}

//拼接url 这个可以考虑放在utils包下
/**
 * 将url和data中的数据拼接成get请求的url
 * 记得在url后面先加个问号
 * @param {*} url 
 * @param {*} data url参数
 */
function formatUrl(url, data){
    url += '?';
    for(var i in data){
        url += i + '=' +data[i] + '&';
    }
    url = url.substring(0, url.length - 1);
    return url;
}
//获取随机字符串 这个可以考虑放在utils包下
//参考微信官方文档
//生成长度为len的随机字符串（暂包含大小写字母，数字）
function getRandomString(){
    //return UUID.randomUUID().toString();
    //len = len || 32;
    //return Math.random().toString(36).substr(2, 15);
    len = 32;
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    var maxpos = chars.length;
    var ranstr = '';
    for (let i = 0; i < len; i++) {
        ranstr += chars.charAt(Math.floor(Math.random() * maxpos));
    }
    return ranstr;
}
//生成签名
//参考支付宝官方文档
function getSign(data){
    try{
        // var privatePem = fs.readFileSync('../config/rsa_private_key.pem');
        var privatePem = fs.readFileSync(path.join(__dirname, '../config') + '/rsa_private_key.pem', 'utf8');
        var key = privatePem.toString();
        var prestr = '';
        var dic = Object.keys(data).sort();
        for(let i = 0; i < dic.length; i++){
            prestr += (dic[i] + '=' +data[dic[i]] + '&');
        }
        //去掉多余字符
        prestr = prestr.substring(0, prestr.length-1);

        var crypto = require('crypto');
        var sign = crypto.createSign('RSA-SHA256');
        sign.update(prestr);
        sign = sign.sign(key, 'base64');
        return encodeURIComponent(sign);
        console.log('\ndataUnsigned: ' +  prestr + '\n');
        console.log('\nencrypted: ' +  encrypted + '\n');
    }catch(err){
        console.log("\ngetSign err: ", err);
    }
}

//验证签名
function checkSign(body, sign){
    // return string(getSign(body)) == string(sign);
    return true;
}

// 获取当前时间戳 todo
function getTimeStamp(){
    parseInt(new Date().getTime() / 1000) + '';
}

function initData(){
    res = {};
    res['app_id'] = '2016091100484470';
    // res['return_url'] = encodeURIComponent(window.location.href);
    res['charset'] = 'utf-8';
    res['sign_type'] = 'RSA2';
    // data['timestamp'] = getCurrentTime();
    res['timestamp'] = '2018-04-01 10:48:22';
    res['version'] = '1.0';
    return res;
}

function formatBiz(data){
    var res = '{';
    for(var i in data){
        res += (`"${i}":"${data[i]}",`)
    }
    res = res.substring(0, res.length - 1);
    res += '}';
    return res;
}
module.exports ={'post': post};
  