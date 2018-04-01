
var code = getQueryString('auth_code');
var url = window.location.href;
function onLoad(){
    //TODO 获取code的方式有没有更加优雅的方法？
    //如果页面的url中没有code，那么就调用微信api静默获取code
    //然后重定向到当前页面，通过url获取code
    if(code == null || code == ''){
        getCode();
    }
    $("#fuck").text(url);
}

function getCode(){
    data = {};

    data['app_id'] = '2016091100484470';
    data['scope'] = 'auth_base';    
    data['redirect_uri'] = (window.location.href);
    requestUrl = formatUrl('https://openauth.alipaydev.com/oauth2/publicAppAuthorize.htm',data)
    
    // requestUrl = 'https://openauth.alipaydev.com/oauth2/publicAppAuthorize.htm?app_id=2016091100484470&scope=auth_base&redirect_uri=http://111.230.51.46:2333/alipay.html';

    // $.get({
    //     url: requestUrl,
    //     // dataType: 'jsonp',
    //     success: function (res) {
    //         alert("success" + res);
    //     },
    //     fail: function (res) {
    //         alert("fail: " + JSON.stringify(res))
    //     },
    //     error: function (res){
    //         alert("err: " + JSON.stringify(res))
    //     }
    // });
    window.location.href = requestUrl;
}

function doPay(){
    formData = $('#confirmPay').serializeArray();
    
    data = {};
    //支付金额，单位为分
    data['total_fee'] = parseInt(formData[0].value) * 100;
    //页面加载时返回的code，用于后台获取openid
    data['code'] = code;
    //todo 其他参数
    
    //调用后台下单接口
    $.ajax({
        url:"http://111.230.51.46:2333/doalipay",
        method:"post",
        data:data,
        // dataType:"json",
        success:function(res){
            // 下单成功后调起微信支付页面
            if(res.status == 'success'){
                doAlipay(res);
            }
            else{
                alert("下单失败: " + res.status);
            }
        },
        error:function(res){
             alert("通信失败: " + JSON.stringify(res));
        }
    });
}

function doAlipay(res){
    AlipayJSBridge.call("tradePay", {
        tradeNO: res.trade_no
    }, function(result) {

        });
}


function dicFormat(data){

}

function formatUrl(url, data){
    url += '?';
    for(var i in data){
        url += (i + '=' +data[i] + '&');
    }
    url = url.substring(0, url.length - 1);
    return url;
}

function getCurrentTime(){

}

function getQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}