//获取url中的参数

function getCurrentTime()
{
     
}

function RSA1(key, data)
{
    var unSignStr = '';
    var dic = Object.keys(data).sort();
    for(let i = 0; i < dic.length; i++){
        unSignStr += (dic[i] + '=' +data[dic[i]] + '&');
    }
    unSignStr = unSignStr.substring(0,unSignStr.length-1);
    res = cryptico.encrypt(unSignStr, key).cipher;
    alert(res)
    return res;
}

