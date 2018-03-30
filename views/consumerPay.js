
// function validate() {
//     return true;
// }
// function consumerPay() {
// if (validate()) {
//     document.getElementByIdx_x("confrimPay").submit();
// }
// }
browserTable = ['Wechat', 'Alipay'];
browserType = 0;
buttonText = ['微信', '支付宝'];
function getMessage()
{ 
    txt = "\n浏览器代码名: " + navigator.appCodeName;
    txt+= "\n浏览器名称: " + navigator.appName; 
    txt+= "\n浏览器平台和版本: " + navigator.appVersion;
    txt+= "\n是否开启cookie: " + navigator.cookieEnabled;
    txt+= "\n操作系统平台: " + navigator.platform; 
    txt+= "\nUser-agent头部值: " + navigator.userAgent; 
    
    return txt;
}
function analyzeBrowser(){
    if(getMessage().indexOf("Alipay") != -1){
        browserType = 1;
    }
    $(function(){
        $("#btn-pay").attr("value", buttonText[browserType] + "支付");
    });
}
function doPay(){
    msg = getMessage();
    money = $('#confirmPay').serialize();
    console.log("lalala");
    $.ajax({
        url:"/confirmpay",
        method:"post",
        data:{msg, money, browserType},
        dataType:"json",
        error:function(data){
            console.log(data);
        },
        success:function(data){
            console.log(data);
        }
    });
}