
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

    data['appid'] = '2016091100484470';
    data['scope'] = 'auth_base';
    data['redirect_uri'] = encodeURIComponent(window.location.href);
    requestUrl = formatUrl('https://openauth.alipay.com/oauth2/publicAppAuthorize.htm',data)
    $.get({
        url: requestUrl,
        // dataType: 'jsonp',
        success: function (res) {
            alert("success" + res);
        },
        fail: function (res) {
            alert("fail: " + JSON.stringify(res))
        },
        error: function (res){
            alert("err: " + JSON.stringify(res))
        }
    });
    // initData(data);
    // privateKey = 'MIICeQIBADANBgkqhkiG9w0BAQEFAASCAmMwggJfAgEAAoGBANeY5lsLmYONo2K85y08FvJMmZhaRpd9PffaEgNWtTh+/+LC0YFX3XEBhBVN+Op2YxmOj7IeDs+IShI6vYANvBHlEF7PkFpDf6NJJN/nKLpg0JpALozSTu8QjxPNj6jw4Ck3v6evQlAkU6JV38wbBcMhlIcg7YWKOkpdEX8uC9l7AgMBAAECgYEAzZwXC/srA2f/yrmG6v/kjl15Ge/2ZKDfiVEiXqbBm0ia9oJ/VRAbspsUgVDkM46GAiiQZ/j8fPVoVqxIbygqE1K7jbmL5xXZyhtvomSdP4CSRAxEo4HYgKyIg2/c61vd9M26JZOeTFYCEroORYqYa+N5/0CG3exJePU/NZHQ7+ECQQDrbheDyTlmfEU71JLwOEUCPn4Tq8hT/tKJxX1J7tNAOBJ10/qB+cu4rQ7HyonkH5Hio7+/mxfaOcK0dlAnKYhxAkEA6m80VNf7BaIPeYRcVN9xiEKWy7eLaiHZjcIKDP3943DYItSjwuRSnNlw12iRSG0EKY5e+xhc1x3bFfRk1tQWqwJBAMjL5RJplaNrakFVVN29oF4BntZ4NSwusrL+1ZUxNMwZBuWoHois3KxuLaUJggInSu3aa7ioNvfRO9de8Y31RoECQQCbxQxGm8QFeCtEGPioxFdRrL0521ldSeSeVqILA/Fg4KgcbKHra36hDbH2z1pJf3ZWjmz59rQpk4LxUZR3UjFFAkEAtSvIND9TEia5QKvLpWK/DUxLT/MMqp2QpZWilbOr+4KGpOWp7ZKzIuTZtzLJxI+qiJ7R2QbaeUMSxf8vo/HH9Q==';
    // data['biz_content'] = "{\"scopes\":[\"auth_base\"],\"state\":\"fuck\",\"is_mobile\":\"true\"}";
    // // data['sign'] = RSA1(privateKey, data);
    // data['sign'] = 'fuck';
    // reqestUrl = formatUrl('https://openapi.alipaydev.com/gateway.do',data)
    // alert(reqestUrl)
    // $.get({
    //         url: reqestUrl,
    //         dataType: 'jsonp',
    //         success: function (res) {
    //             alert("success" + res);
    //         },
    //         fail: function (res) {
    //             alert("fail: " + JSON.stringify(res))
    //         },
    //         error: function (res){
    //             alert("err: " + JSON.stringify(res))
    //         }
    // });
}

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
        url:"/doalipay",
        method:"post",
        data:data,
        dataType:"json",
        success:function(res){
            // 下单成功后调起微信支付页面
            if(res.status == 'success'){
                doAlipay(res);
            }
            else{
                alert("下单失败: " + res);
            }
        },
        error:function(res){
             alert("通信失败: " + res);
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