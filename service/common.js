const redisClient = require('./redis').redisClient; //使用redis客户端。
const AV = require('leanengine'); //使用 leanengine
const Promise = require('bluebird'); //处理promise异步方法，将redis封装为promise的异步方法。
const _ = require('underscore'); //使用map() filter()等方法
const common = require('./common'); //存放可以复用的代码
const axios = require('axios');
const uuid = require('uuid/v4');
const wxpay = require('./wxpay'); //使用微信支付。
const {getAccessToken} = require('./access-token'); //生成accesstoken并且保持有效。
const WXBizDataCrypt = require('./WXBizDataCrypt'); //解析用户数据

const APPID = process.env.WEIXIN_APPID;
const APPSECRET = process.env.WEIXIN_APPSECRET;



//向STRING赋值函数；
function setString(...keys) {
    redisClient.setAsync(...keys).then(res => {}).catch(console.error);
}

//向STRING取值函数；
function getString(key) {
    redisClient.getAsync(key).then(res => {return res;}).catch(console.error);
}

//向hash赋值函数；
function setHash(...keys) {
    redisClient.hmsetAsync(...keys).then(res => {}).catch(console.error);
}

//向hash取值函数；
function getHash(key, field) {
    redisClient.hget(key, field, function(err, response) {
        console.log('我是response'+response);
        value = response;
    });
}

//向SET赋值函数；
function setSet(...keys) {
    redisClient.hmsetAsync(...keys).then(res => {}).catch(console.error);
}

//向SET取值函数；
function getSet(...keys) {
    redisClient.hmsetAsync(...keys).then(res => {}).catch(console.error);
}

//向List赋值函数；
function setList(...keys) {
    redisClient.hmsetAsync(...keys).then(res => {}).catch(console.error);
}

//向List取值函数；
function getList(...keys) {
    redisClient.hmsetAsync(...keys).then(res => {}).catch(console.error);
}

//向ZSet赋值函数；
function setZSet(...keys) {
    redisClient.hmsetAsync(...keys).then(res => {}).catch(console.error);
}

//向ZSet取值函数；
function getZSet(...keys) {
    redisClient.hmsetAsync(...keys).then(res => {}).catch(console.error);
}


// 设置主键  调用方式redis（ key1 + key2 + key3 + key4）
function redisKey(...keys) {
    let key = '';
    for (let i = 0, len = keys.length; i < len; i++) {
        key += keys[i];
    }
    return key;
}

//向hash赋值函数；
function set_hash(key, field, value) {
    return redisClient.hsetAsync(key, field, value).then(results => {
        return results;
    }).catch(console.error);
}

//在有序列表{{尾部}}增加值
function rpush(key, value) {
    return redisClient.rpushAsync(key, value).then(results => {
        return results;
    }).catch(console.error);
}


// 发送模板消息
function send_subscribe_message(form) {
    console.log('发送服务消息');
    const data = {
        touser: 'okKk441WFXWQhwAAhJ1ensPKiQW8',
        template_id: 'm6VMcsUVoq3xqnXtEjKh0QQI8jRA2g61kez5vfHBfDs',
        page: '/pages/act/act',
        data: {
            "thing1": {
                "value": "丝芙兰100美金礼品卡"
            },
            "thing2": {
                "value": "汇率4.90，卡商微信:xxxxxxxx"
            }
        },
    };
    console.log('send notice:', data);
    return getAccessToken().then(accessToken => {
        console.log(accessToken);
        axios.post('https://api.weixin.qq.com/cgi-bin/message/subscribe/send', data, {
            params: {
                access_token: accessToken,
            },
        }).then(({
            data
        }) => {
            console.log('我是data',data);
        })
    });
}


/**
 * 如果用户有sharer，将用户的key添加到sharer的集合中。
 * 后续需要修改这个，查询sharees_uid表中，是否有超过50人，如果有超过50人则不进行操作。
 */
function set_sharer(sharer_uid,key) {
    redisClient.smembersAsync('sharees_' + sharer_uid).then(results => {
        let amounts = results.length;
        if (amounts<50){
            redisClient.saddAsync('sharees_' + sharer_uid, key).then(result => {
                console.log(result);
            }).catch(console.error);
        }
    }).catch(console.error);
}


//取 hash 的所有值
function get_field(key,field) {
    return redisClient.hgetAsync(key, field).then(results => {
        return results;
    }).catch(console.error);
}

//在有序列表{{头部}}增加值
function lpush(key,value) {
    return redisClient.lpushAsync(key,value).then(results => {
        return results;
    }).catch(console.error);
}

module.exports.setString = setString;
module.exports.getString = getString;
module.exports.setHash = setHash;
module.exports.getHash = getHash;
module.exports.setSet = setSet;
module.exports.getSet = getSet;
module.exports.setList = setList;
module.exports.getList = getList;
module.exports.setZSet = setZSet;
module.exports.getZSet = getZSet;
module.exports.redisKey = redisKey;
module.exports.send_subscribe_message = send_subscribe_message;
module.exports.set_sharer = set_sharer;


module.exports.set_hash = set_hash;
module.exports.rpush = rpush;

module.exports.get_field = get_field;
module.exports.lpush = lpush;

