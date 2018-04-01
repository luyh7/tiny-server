

//以后要改成.json格式
const host = 'http://111.230.51.46:2333';
const DEBUG = {'LOCAL':0, 'TEST':1, 'RELEASE':2};

const debugFlag = DEBUG.TEST;



const aliAppid = (debugFlag > DEBUG.TEST)?'':'2016091100484470';
const alipayAuth = 'https://openauth.alipaydev.com/oauth2/publicAppAuthorize.htm?'+
                    `app_id=${aliAppid}`+
                    '&scope=auth_base'+
                    `&redirect_uri=${host}/alipay.html`;
const wxAppid = (debugFlag > DEBUG.TEST)?'':'wx9d5c367ebf3e3436';
const wechatAuth = 'https://open.weixin.qq.com/connect/oauth2/authorize'+
                    `appid=${wxAppid}`+
                    'scope=snsapi_base'+
                    'response_type=code'+
                    'state='+
                    '#wechat_redirect'+
                    'redirect_uri='+encodeURIComponent(`${host}/wechatpay.html`);

const navigatePage = {'wechat': wechatAuth, 'alipay':alipayAuth};
