//request需要做一层封装，不然代码不够优雅
var request = require('request')

//本服务器域名，从config取
const host = 'todo';

//下单接口
function post(req, res, next) {
    getOpenid(req.body, res);
}

/**
 * 通过code获取用户openid
 * @param {*} body 前端传来的数据
 * @param {*} res 返回消息给前端的句柄，这个考虑要不要作为全局变量
 */
function getOpenid(body, res){
    var data = {};
    var userPayInfo = {};

    userPayInfo['total_fee'] = body.total_fee;

    //公众号的appid这里需要改成从config表获取的方法
    data['appid'] = '';
    data['secret'] = '';
    //从前端获取的code
    data['code'] = body.code;
    //默认
    data['grant_type'] = 'authorization_code';

    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token';
    url = formatUrl(url, data);
    //获取用户openid
    request.get(
        url, 
        function (error, response, body) {  
            if (!error && response.statusCode == 200) {
                console.log(body);
                //微信统一下单
                placeOrder(userPayInfo, body, res);
            } else{
                console.log('err in getOpenid: ' +  error);
            }
    })
}

/**
 * 成功获取openid后，进行统一下单操作
 * @param {*} userPayInfo 从前端获取的支付数据
 * @param {*} body 从微信接口获取openid返回的数据
 * @param {*} res 返回消息给前端的句柄
 */
function placeOrder(userPayInfo, body, res){
    var data = {};
    //
    data['appid'] = 'todo';
    //微信支付分配的商户号，从config获取
    data['mch_id'] = 'todo';
    //非必须参数 可以为终端设备号(门店号或收银设备ID)，PC网页或公众号内支付可以传"WEB"
    data['device_info'] = 'WEB';
    //随机字符串，长度要求在32位以内
    data['nonce_str'] = getRandomString();
    //商品简单描述
    data['body'] = '微pay-用户支付';
    //非必需参数 商品详细描述
    data['detail'] = '';
    //附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用
    data['attach'] = '';
    //商户系统内部订单号，在同一个商户号下唯一
    data['out_trade_no'] = '0000';
    //非必需参数 标价币种，符合ISO 4217标准的三位字母代码
    data['fee_type'] = 'CHY';
    //订单总金额，单位为分
    data['total_fee'] = userPayInfo.total_fee;
    //网页支付提交用户端ip
    data['spbill_create_ip'] = 'todo';

    // 非必需参数 订单生成时间，格式为yyyyMMddHHmmss
    // data['time_start'] = ''
    // 非必需参数 订单失效时间，格式为yyyyMMddHHmmss
    // data['time_expire'] = ''

    // 非必需参数 订单优惠标记 用于提供使用优惠券功能
    data['goods_tag'] = ''
    // 异步接收微信支付结果通知的回调地址
    data['notify_url'] = `${host}/notifymerchant`;
    // 交易类型 JSAPI:公众号支付 NATIVE:扫码支付 APP:APP支付
    data['trade_type'] = 'JSAPI';

    // 非必需参数 扫码支付时需要填写
    // data['product_id'] = '';
    // 非必需参数 上传此参数no_credit--可限制用户不能使用信用卡支付
    // data['limit_pay'] = 'no_credit';

    // 微信用户在商户对应appid下的唯一标识
    data['openid'] = body.openid;

    //用于上报场景信息，目前支持上报实际门店信息
    data['scene_info'] = '';

    //非必需参数 签名类型，默认为MD5
    data['sign_type'] = 'MD5';
    //签名 这个语句要放在所有参数赋值后面
    data['sign'] = getSign(data);
    var url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
    url = formatUrl(url, data);

    //更新数据库 todo

    //请求统一下单api
    request.get(
        url, 
        function (error, response, body) {  
            if (!error && response.statusCode == 200) {
                console.log(body);
                // 下单完成之后通知前端
                callbackClient(body, res);
            } else{
                console.log('err in placeOrder: ' +  error);
            }
    })
}

function callbackClient(body, res){
    //下单成功
    if(body.return_code == 'SUCCESS' && body.result_code == 'SUCCESS'){
        data = {};

        // 下单返回的随机字符串和签名
        nonce_str = body.nonce_str;
        sign = body.sign;
        
        // 预支付会话标识，前端利用这个调起支付页面
        data['package'] = "prepay_id=" + body.prepay_id;
        data['appId'] = '';
        data['nonceStr'] = getRandomString();
        data['signType'] = 'MD5';
        data['timeStamp'] = getTimeStamp();
        //签名不包括status，所以必须要排在status赋值之前
        data['paySign'] = getSign(data);

        //传给前端的成功标识，这个要用静态类封装 todo
        data['status'] = 'success';

        //验签失败，不能继续支付
        if(!checkSign(body,sign)){
            data['status'] = 'fail';
        }
    }
    // 下单失败
    else if(body.result_code == 'FAIL'){
        data['status'] = 'fail';
    }
    // 通信失败
    else{
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
    
}
//获取随机字符串 这个可以考虑放在utils包下
//参考微信官方文档
function getRandomString(){
    
}
//生成签名
//参考微信官方文档
function getSign(data){

}

//验证签名
function checkSign(body, sign){
    return string(getSign(body)) == string(sign);
}

// 获取当前时间戳 todo
function getTimeStamp(){

}
module.exports ={'post': post};
  