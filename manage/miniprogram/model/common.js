const AV = require('../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../utils/av-live-query-weapp-min');
var app = getApp();

/**
用户登录：
    console.log(res.code);
    拿到res.code 到后台换openid
    发送 res.code 到后台换取 openId, sessionKey, unionId
    返回值data为0或1，返回值为0，用户没有注册过，返回值为1，用户已经注册过。
*/
function login() {
        wx.login({
            success: res => {
                var paramsJson = {
                    code: res.code,
                    app_name: 'daojucheng'
                };
                AV.Cloud.run('login', paramsJson).then(function (data) {
                    console.log(1);
                }).catch(console.error);
            }
        });
}

/**
 * 生成时间字符串
 */
function get_full_time(d) {
    return String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2);
}


/**
 * 生成时间字符串
 */
function get_times() {
    let d = new Date();
    return d.getTime();
}
/**
 * 
 * 获取用户的手机号码
 */
function getPhoneNumber(e) {
    console.log(app.globalData.userInfo.objectid);
    if (app.globalData.userInfo.objectid) {
      const paramsJson = {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          sessionKey: app.globalData.userInfo.session_key,
          openid: app.globalData.userInfo.objectid
      };
      console.log(paramsJson);
      return AV.Cloud.run('getPhoneNumber', paramsJson).then(function (data) {
          console.log('云函数回应' + data.phoneNumber);
          return data.phoneNumber;
      }).catch(console.error);
    }else{
        //如果没有获取到用户objectid的流程
        console.log('还没有拿到用户的objectid');
    }
  }

/**
 * formid
 * @param res {
 * 
 * }  
 */
function formSubmit(res) {
    //   let paramsJson = {
    //       key: res.key,
    //       value: JSON.stringify(res),
    //   }
    //   Cloud.run('rpush', paramsJson).then(result => {
    //       console.log('formid已经上传',result);
    //   });
}
/**
 * exchange 商品
 */
function exchange(res) {
    const paramsJson = {
        openid: app.globalData.userInfo.objectid,
        commodity_id:res,
    };
    AV.Cloud.run('exchange', paramsJson).then(function (data) {
        console.log('云函数回应' + data);
    }).catch(console.error);
}


/**
 * pushValueToRedisKey
 * 将值追加到redis某个key中， key的值是[...]
 */
function pushValueToRedisKey(k,v) {
    const paramsJson = {
        key: k,
        value: v, //value是一个经过JSON.stringify()序列化后的字符串
    };
    AV.Cloud.run('pushValueToKey', paramsJson).then(function (data) {
        console.log('云函数回应' + data);
    }).catch(console.error);
}

/**
 * pushValueToRedisField
 * 将值追加到redis某个key的field中， field中的值是[...]
 */
function pushValueToRedisField(k,f,v) {
    const paramsJson = {
        key: k, //key的名字
        field: f, //field的名字
        value: v, //value是一个经过JSON.stringify()序列化后的字符串
    };
    AV.Cloud.run('pushValueToKey', paramsJson).then(function (data) {
        console.log('云函数回应' + data);
    }).catch(console.error);
}

//点击banner广告
function tapBanner() {
        let d = new Date();
        let time = d.getTime();
        let date = String(d.getMonth()) + String(d.getDate()) + String(d.getHours());
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += Math.floor(Math.random() * 10);
        }
        const paramsJson = {
            code: code,
            time: time,
            date: date,
            uid: app.globalData.userInfo.uid,
        };
        AV.Cloud.run('tapBanner', paramsJson).then(function (data) {
            console.log('云函数回应' + data);
        }).catch(console.error);
}

//点击弹出广告
function tapInterstitial(item, name, key) {
    let d = new Date();
    let time = d.getTime();
    let date = String(d.getMonth()) + String(d.getDate()) + String(d.getHours());
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += Math.floor(Math.random() * 10);
    }
    const paramsJson = {
        code: code,
        time: time,
        uid: app.globalData.userInfo.uid,
        item:item,
        date: date,
        name: name,
        key: key,
    };
    return AV.Cloud.run('tapInterstitial', paramsJson);
}
//点击激励视频广告
function tapPromotion(params) {
    const paramsJson = {
        code: code,
        time: time,
        uid: app.globalData.userInfo.uid,
        itemid: params.itemid,
        productid: params.productid,
        gameid: params.gameid,
        name: params.name,
        property: params.property,
        key: params.key,
        sharer: params.sharer,
        isEnded: params.isEnded ? true : false,//视频是否播完？？？？
    };
    console.log(paramsJson);
    return AV.Cloud.run('tapPromotionNew', paramsJson);
}
/**
 * 获取redis某个string 类型的key  中的string
 * @param  key =  redis的key的值
 */
function getValue(key) {
    let paramsJson = {
        key: key
    };
    return AV.Cloud.run('getValue', paramsJson);
}

/**
 * redis  set某个hash表中的所有数据。
 * @param  key =  redis的key的值
 */
function setString(key, value) {
    console.log(JSON.stringify(value))
    let paramsJson = {
        key: key,
        value:JSON.stringify(value)
    };
    return AV.Cloud.run('setString', paramsJson);
}

/**
 * redis 给某个key设置过期时间。
 * @param  key =  redis的key的值
 */
function setExpireTime(key, value) {
    let paramsJson = {
        key: key,
        value: value
    };
    return AV.Cloud.run('setExpireTime', paramsJson);
}

/**
 * 获取redis某个hash表中的所有数据。
 * @param  key =  redis的key的值
 */
function getField(key,field) {
    let paramsJson = {
        key: key,
        field:field,
    };
    return AV.Cloud.run('getField', paramsJson);
}
/**
 * 获取redis某个hash表中的所有数据。
 * @param  key =  redis的key的值
 */
function getHash(key) {
    let paramsJson = {
        key: key
    };
    return AV.Cloud.run('getHash', paramsJson);
}
/**
 * 获取redis多个hash的列表
 * @param  key =  模糊查询的key
 */
function getList(key) {
    const paramsJson = {
        key: key
    };
    return AV.Cloud.run('getList', paramsJson);
}

/**
 * 模糊查询redis 的key,并返回数量
 * @param  key =  模糊查询的key
 */
function getListAmount(key) {
    const paramsJson = {
        key: key
    };
    return AV.Cloud.run('getListAmount', paramsJson);
}

/**
 * sharee通过sharer分享的小程序码登录，获得积分奖励。
 * @param  
 */
function getShares(paramsJson) {
    return AV.Cloud.run('shares', paramsJson);
}


/**
 * sharee通过sharer分享的小程序码登录，获得积分奖励。
 * @param  
 */
function set_field(key,field,value) {
    const paramsJson = {
        key: key,
        field:field,
        value:value,
    };
    AV.Cloud.run('setField', paramsJson).then(data => {
        console.log(data);
    });
}




/**
 * sharee通过sharer分享的小程序码登录，获得积分奖励。
 * @param  
 */
function lpush(key,value) {
    const paramsJson = {
        key: key,
        value:value,
    };
    AV.Cloud.run('lpush', paramsJson).then(data => {
        console.log(data);
    });
}


function list_del_item(key,amount,value) {
    const paramsJson = {
        key: key,
        amount:amount,
        value:value,
    };
    AV.Cloud.run('list_del_item', paramsJson).then(data => {
        console.log(data);
    });
}



//////////////////////////////////////////////////////////////////////
/**
 * 以下存放与业务无关的代码
 */

/**
 * 获取redis多个hash的列表
 * @param  key =  模糊查询的key
 * @param c = 云函数名
 */
function setDataToRedis(key,cf) {
    const paramsJson = {
        key: key
    };
    AV.Cloud.run(cf, paramsJson);
}

/**
 * scan and send formid
 */
function scanFromId() {
    let d = new Date();
    let d1 = new Date(d - 86400000);
    let day = String(d1.getMonth()) + String(d1.getDate());
    let paramsJson = {
        day: day,
    };
    console.log(JSON.stringify(paramsJson));
    AV.Cloud.run('scanFromId', paramsJson).then((x) => {
        console.log(x);
    });
}
//////////////////////////////////////////////////////////////////////
/**
 * 以下存放，客户端与业务无关代码
 */
//弹出模态弹窗
function showModal(c, t, fun) {
    if (!t)
        t = '提示'
    wx.showModal({
        title: t,
        content: c,
        showCancel: false,
        success: fun
    })
}

//弹出模态弹窗
function showToast(c) {
    wx.showToast({
        title: c,
        icon: 'none',
        duration: 2000
    })
}

/**
 * 
 */
function navigateTo(url) {
    wx.navigateTo({url: url});
}


module.exports.login = login;
module.exports.getPhoneNumber = getPhoneNumber;
module.exports.exchange = exchange;
module.exports.pushValueToRedisKey = pushValueToRedisKey;
module.exports.pushValueToRedisField = pushValueToRedisField;
module.exports.tapBanner = tapBanner;
module.exports.tapInterstitial = tapInterstitial;
module.exports.tapPromotion = tapPromotion;
module.exports.setExpireTime = setExpireTime;
module.exports.setString = setString;
module.exports.getValue = getValue;
module.exports.getField = getField;
module.exports.getHash = getHash;
module.exports.getList = getList;
module.exports.getListAmount = getListAmount;
module.exports.getShares = getShares;
module.exports.formSubmit = formSubmit;
module.exports.set_field = set_field;
module.exports.lpush = lpush;
module.exports.list_del_item = list_del_item;

//////////////////////////////////////////////////////////////////////
//以下存放，与业务无关，处理redis的代码
module.exports.setDataToRedis = setDataToRedis;
module.exports.scanFromId = scanFromId;


//////////////////////////////////////////////////////////////////////
//以下与业务无关，前端展示的代码
module.exports.showModal = showModal;
module.exports.showToast = showToast;
module.exports.get_full_time = get_full_time;

module.exports.get_times = get_times;
module.exports.navigateTo = navigateTo;