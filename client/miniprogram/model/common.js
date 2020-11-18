const AV = require('../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../utils/av-live-query-weapp-min');
var app = getApp();

/**
 * 生成时间字符串
 */
function get_full_time() {
    let d = new Date();
    return String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2);
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
 * redis  set某个hash表中的所有数据。
 * @param  key =  redis的key的值
 */
function incre_amount(key, field, value) {
    let paramsJson = {
        key: key,
        field:field,
        value: value,
    };
    console.log(paramsJson);
    return AV.Cloud.run('increField', paramsJson);
}

/**
 * redis  set某个hash表中的所有数据。
 * @param  key =  redis的key的值
 */
function set_field(key, field, value) {
    let paramsJson = {
        key: key,
        field:field,
        value: value,
    };
    console.log(paramsJson);
    return AV.Cloud.run('setField', paramsJson);
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
    return AV.Cloud.run('getField', paramsJson).then(result =>{
        return result;
    });
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
 * 请求模板消息发放资格
 */
function request_subs() {
    let set_code = (tmpids) => {
        console.log(tmpids);
        wx.requestSubscribeMessage({
            tmplIds: tmpids,
            success(res) {
                console.log(res);
                for (const i of tmpids) {
                    if (res[i] == 'accept') {
                        console.log(i);
                        const paramsJson = {
                            key: 'service_notice_sugar_' + i,
                            field: app.globalData.userInfo.objectid,
                            value: 1,
                        };
                        console.log(paramsJson);
                        return AV.Cloud.run('increField', paramsJson).then((x) => {
                            console.log('result:', x);
                        });
                    }
                }
            },
            fail(res) {
                console.log(res);
            }
        });
        wx.requestSubscribeMessage();
    }
    let query_tmpids = () => {
        const paramsJson = {
            key: 'service_notice_model_sugar',
        };
        console.log(paramsJson);
        return AV.Cloud.run('get_list_details_strings', paramsJson).then((tmpids) => {
            console.log(tmpids);
            set_code(tmpids);
        });
    }
    query_tmpids();

}


/**
 * 
 */
function navigateTo(url) {
    wx.navigateTo({url: url});
}

/**
 * 
 */
function switchTab(url) {
    wx.switchTab({url: url});
}

/**
 * 返回页面delta：1
 */
function navigateBack(delta) {
    wx.navigateBack({delta: delta});
}



//////////////////////////////////////////////////////////////////////
/**
 * 以下存放，客户端与业务无关代码
 */
//弹出模态弹窗
function showModal(c, t, func) {
    if (!t)
        t = '提示'
    wx.showModal({
        title: t,
        content: c,
        showCancel: false,
        success: func
    })
}

//弹出模态弹窗
function showToast(c,func) {
    wx.showToast({
        title: c,
        icon: 'none',
        duration: 2000,
        success: func
    });
}


/**
 * login  重新login以更新用户的信息
 */
function login() {
    let u = {};
    wx.login({
      success: res => {
        let paramsJson = {
          code: res.code,
        };
        AV.Cloud.run('login', paramsJson).then(function (user) {
          let {phoneNumber=null,wechatid=null,shop=0,invitation_code=null,sharer=null,status=0} = user;
          u = user;
          u.phoneNumber = phoneNumber;
          u.wechatid = wechatid;
          u.shop = shop;
          u.invitation_code = invitation_code;
          u.sharer = sharer;
          u.status = status;
          app.globalData.userInfo = u;
          console.log(user)
        }).then(() => {
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(u);
          }
        }).catch(console.error);
      }
    });
}
/**
 * 修改用户的某些数据
 */
function set_user_field(field,value) {
    const paramsJson = {
    uid:app.globalData.userInfo.uid,
    code:app.globalData.userInfo.code,
    field: field,
    value: value,
    };
    AV.Cloud.run('set_users_field', paramsJson).then((result) => {
    }).catch(console.error);
}

/**
 * 修改用户的某些数据
 */
function copy(data,func) {
    wx.setClipboardData({
      data: data,
      success: func
    });
}


module.exports.getPhoneNumber = getPhoneNumber;
module.exports.login = login;
module.exports.set_user_field = set_user_field;

///////////////////////////////////////////////////////////
//以下与业务无关，前端展示的代码
module.exports.showModal = showModal;
module.exports.showToast = showToast;
module.exports.get_full_time = get_full_time;

module.exports.navigateTo = navigateTo;
module.exports.switchTab = switchTab;
module.exports.navigateBack = navigateBack;
//////////////////////////////////////////////////////////////////////
module.exports.request_subs = request_subs;







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
module.exports.incre_amount = incre_amount;
module.exports.set_field = set_field;

module.exports.copy = copy;


//////////////////////////////////////////////////////////////////////
//以下与业务无关，前端展示的代码
module.exports.showModal = showModal;
module.exports.showToast = showToast;
module.exports.get_full_time = get_full_time;





module.exports.request_subs = request_subs;
