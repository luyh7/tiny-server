
const network = require('../utlis/network')
//用户支付完成后回调此接口
//从数据库取出订单数据进行比对
//通知商户成功支付的消息
function get(req, res, next) {
    console.log(req.body);
    body = req.body;
    //返回的参数
    var data = {};
    if(body.return_code == 'SUCCESS' && body.result_code == 'SUCCESS'){
        appid = body.appid;
        sign = body.sign;
        if(!checkSign(body,sign)){
            data['return_code'] = 'FAIL';
            data['return_msg'] = '签名失败';
            res.json(data);
            return;
        }
        //这里需要用商户订单号从数据库取订单信息，然后进行比对
        out_trade_no = body.out_trade_no;
        //需要比对的数据如下：
        openid;
        total_fee;
        settlement_total_fee;
        fee_type;
        transaction_id;
        //数据库中应该有通知商户完成的字段，防止微信多次回调造成重复通知 todo
        
        //比对成功后通知微信，确认这笔支付
        data['return_code'] = 'SUCCESS';
        res.json(data);

        //这里放通知商户和更新数据库的代码
        network.income++;

    }
    else if(body.result_code == 'FAIL'){
        console.log(body.return_msg);
        data['return_code'] = 'FAIL';
        data['return_msg'] = body.err_code_des;
        res.json(data);
    }
    else{
        data['return_code'] = 'FAIL';
        data['return_msg'] = '通信出错';
        res.json(data);
    }
}

//验证签名
function checkSign(body, sign){
    
}

module.exports ={'get': get};