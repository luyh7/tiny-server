
// browserTable = ['Wechat', 'Alipay'];
// browserType = 0;
// buttonText = ['微信', '支付宝'];

const code = getQueryString('code');
//用户加载页面时的处理
function onLoad(){
    //TODO 获取code的方式有没有更加优雅的方法？
    //如果页面的url中没有code，那么就调用微信api静默获取code
    //然后重定向到当前页面，通过url获取code
    if(code == null || code == ''){
        getCode();
    }
}

//用户向后台下单
function doPay(){
    money = $('#confirmPay').serialize();

    data = {};
    //支付金额，单位为分
    data['total_fee'] = parseInt(money) * 100;
    //页面加载时返回的code，用于后台获取openid
    data['code'] = code;
    //todo 其他参数

    //调用后台下单接口
    $.ajax({
        url:"/dowxpay",
        method:"post",
        data:data,
        dataType:"json",
        success:function(res){
            // 下单成功后调起微信支付页面
            if(res.status == 'success'){
                doWXPay(res);
            }
        },
        error:function(data){
            // alert(data);
        }
    });

    
}


function getCode(){
    data = {};
    //公众号注册的appid，之后考虑安全性需要从后端获取
    data['appid'] = 'todo';
    //授权后重定向的回调链接地址，请使用 urlEncode 对链接进行处理
    //重定向到原来的页面即可
    data['redirect_uri'] = encodeURIComponent(window.location.href);
    //静默授权需要返回的参数
    data['response_type'] = 'code';
    //授权方式
    data['scope'] = 'snsapi_base';
    //重定向后会带上state参数，可以不填
    data['state'] = '';
    //必带参数，方便起见，这里选择拼在state后面
    data['state'] = '#wechat_redirect';
    $.ajax({
        url:"https://open.weixin.qq.com/connect/oauth2/authorize",
        method:"get",
        data:data,
        dataType:"json",
        success:function(data){
            // alert(data);
        },
        error:function(data){
            // alert(data);
        }
    });
    
}

//获取url中的参数
function getQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}

function doWXPay(data){
    WeixinJSBridge.invoke(
        'getBrandWCPayRequest', {
            "appId":data.appId,     //公众号名称，由商户传入     
            "timeStamp":data.timeStamp,         //时间戳，自1970年以来的秒数     
            "nonceStr":data.nonceStr, //随机串     
            "package":data.package,     
            "signType":data.signType,         //微信签名方式：     
            "paySign":data.paySign //微信签名 
        },
        function(res){    
            //todo 
            //支付成功
            if(res.err_msg == "get_brand_wcpay_request:ok" ) {

            }

            //用户取消支付
            if(res.err_msg == "get_brand_wcpay_request:cancel"){

            }

            //支付失败
            if(res.err_msg == "get_brand_wcpay_request:fail"){

            }
        }
    ); 
 }

