/**
 * 这个是快闪店的代码
 */



const redisClient = require('./redis').redisClient; //使用redis客户端。
const base64 = require('base64encodedecode'); //将二进制数据转码成base64
const AV = require('leanengine');     //使用 leanengine
const Promise = require('bluebird');  //处理promise异步方法，将redis封装为promise的异步方法。
const _ = require('underscore');      //使用map() filter()等方法
const Order = require('./order');     //引用自定义Order类
const common = require('./common'); //存放可以复用的代码
const formid = require('./formid'); //发放formid
const goods = require('./goods'); //商品的管理
const upload_info = require('./upload_info'); //上传goods到redis
const axios = require('axios');
const uuid = require('uuid/v4');
const wxpay = require('./wxpay');     //使用微信支付。
const {getAccessToken} = require('./access-token');   //生成accesstoken并且保持有效。
const WXBizDataCrypt = require('./WXBizDataCrypt'); //解析用户数据
// const request = require('request');

let APPID = process.env.WEIXIN_APPID;
let APPSECRET = process.env.WEIXIN_APPSECRET;

const userPrefix = 'user_';

///////////////////////////////////////////////////////////////注册和登录的API
/**
用户登录：
1.通过传的res.code 解密用户的openid
2.查询用户的openid，是否存在于redis的key中；
3.如果存在key，证明用户已经登录过；更新用户的基础信息；
4.如果未存在key，证明用户是新用户。
5.数据返回值。
 */
AV.Cloud.define('login', (request, response) => {
  console.log('进入login流程');
  let {
    sharer = null
  } = request.params;
  axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    params: {
      grant_type: 'authorization_code',
      appid: APPID,
      secret: APPSECRET,
      js_code: request.params.code,
    }
  }).then(({
    data: {
      openid,
      session_key
    }
  }) => {
    let key = userPrefix + openid;
    redisClient.existsAsync(key).then(data => {
      // console.log(data);
      if (data == 1) {
        //系统中存在用户信息，也就是说用户登录过,将用户的信息返回。
        console.log('我是老用户');
        redisClient.hsetAsync(key, 'session_key', session_key).then(() => {
          redisClient.hgetallAsync(key).then(result => {
            let user = result;
            user.is_new_user = false;
            console.log('我是user');
            // console.log(user);
            response.success(user);
          });
        }).catch(console.error);

      } else {
        //系统中没有用户信息，也就是说用户是全新的用户。
        console.log('我是新用户');
        redisClient.hgetAsync('settings', 'current_user_id').then((res) => {
          //给uid openid对照表
          if (sharer != null) {
            common.set_sharer(sharer, key); //如果存在sharer，把sharer记录下来。
          }
          let multi = redisClient.multi();
          multi.hset('user_uid', res, openid); //建立uid 与openid的对应表;
          multi.hmset(key, 'objectid', openid, 'sharer', sharer, 'session_key', session_key, 'uid', res, 'balance', 0, 'consume', 0, 'i_balance', 0, 'i_consume', 0, 'f_balance', 50, 'f_consume', 0, 'share_times', 0, 'watch_times', 0, 'deposit', 0);
          multi.hincrby('settings', 'current_user_id', 1);
          multi.execAsync().then(() => {
            redisClient.hgetallAsync(key).then(result => {
              let user = result;
              user.is_new_user = true;
              // console.log('我是新用户注册',user);
              response.success(user);
            });
          });
        });
      }
    });
  }).catch(function (error) {
    console.log(error)
  });
});



/**
 * 获取用户的小程序码
 */
AV.Cloud.define('getMiniQRCode', (request,response) => {
      let {scene=null,page=null,type=null} = request.params;
      const data = {
        scene: scene,
        page:page,
      };
      console.log('send notice: ', data);
      getAccessToken().then(accessToken => {
        console.log(accessToken)
        axios.post('https://api.weixin.qq.com/wxa/getwxacodeunlimit', data, {
          params: {
            access_token: accessToken,
          }, 
          responseType: 'arraybuffer', 
          responseEncoding: null, // default
        }).then(({
          data
        }) => {
          if(type == 'user'){
            let message64 = {
              base64: data.toString('base64')
            };
            let file1 = new AV.File('resume.png', message64);
            file1.save().then(function (file) {
              console.log('文件保存完成。objectId：' + file);
              response.success(file);
            }, function (error) {
              // 保存失败，可能是文件无法被读取，或者上传过程中出现问题
            });
          }
          else {
            response.success(data);
          }
        });
      });
});


/**
用户授权后，获取用户的基础信息：
1.通过传的res.code 解密用户的openid；
2.查询用户的openid，是否存在于redis的key中；
3.如果存在key，证明用户已经登录过；更新用户的基础信息；
4.如果未存在key，证明用户是新用户。
 */
AV.Cloud.define('getUserInfo', (request, response) => {
    console.log('进入getUserInfo流程');
    let {gender, nickName, language, city, province, country, avatarUrl} = request.params.userinfo;
    let key = userPrefix + request.params.objectid;
    redisClient.hmsetAsync(key, 'gender', gender, 'nickName', nickName, 'language', language, 'city', city, 'province', province, 'country', country, 'image', avatarUrl).then(() => {
      redisClient.hgetallAsync(key).then(user => {
        response.success(user);
      });
    }).catch(console.error);
});
/**
 * 用户授权后， 解密用户的手机号码， 并将手机号码传到用户key 的field（ phoneNmuber） 中
 * 如果用户同意了授权，返回手机号码，如果用户没有同意授权，返回0
 */
AV.Cloud.define('getPhoneNumber', (request, response) => {
    console.log('进入getPhoneNumber流程');
    console.log(request.params);
    const field = 'phoneNumber';
    const appId = process.env.WEIXIN_APPID;
    let {sessionKey,encryptedData,iv,openid} = request.params;
    //如果用户同意了查询手机号码
    if (Boolean(encryptedData)) {
        let pc = new WXBizDataCrypt(appId, sessionKey);
        let data = pc.decryptData(encryptedData, iv);
        redisClient.hsetAsync(userPrefix + openid, field, data.phoneNumber).then(res => {
          console.log(res);
        }).catch(console.error);
        response.success(data);
    }
    else{
      //如果用户没有同意查询用户的手机号码
      response.success(0);
    }

});
////////////////////////////////////////////////////////////////////////////////////业务API
/**
 *  微信企业付款到用户
 */
AV.Cloud.define('wxcompay', (request, response) => {
  console.log('进入企业付款流程');
  let { amount, openid, desc} = request.params;
  wxpay.wxcompay({
    amount: amount,
    openid: openid,
    desc: desc
  }, function (res) {
    response.success(res);
  });
});

/** 
 * 小程序创建订单
 */

AV.Cloud.define('order', (request, response) => {
  const order = new Order();
  let {address=null,coins=0,coupon=0,fee=0,piece=0,price=0,trans_fee=0,type=0} = request.params;
  console.log(request.params.amount);
  console.log(typeof(request.params.amount));
  order.tradeId = uuid().replace(/-/g, '');
  order.status = 'INIT';
  order.openid = request.params.objectid;
  order.productDescription = request.params.productDescription;
  order.amount = request.params.amount;
  order.commodity_type = request.params.commodity_type;
  order.list_id = request.params.list_id;
  order.uid = request.params.uid;
  order.username = request.params.username;
  order.key = request.params.key;
  order.sharer = request.params.sharer;
  order.sku = request.params.sku;
  order.address = address;
  order.coupon = coupon;
  order.remark = request.params.remark;
  order.coins = coins;
  order.transmit = request.params.transmit;
  order.fee = fee;
  order.price = price;
  order.piece = piece;
  order.trans_fee = trans_fee;
  order.image = request.params.image;
  order.ip = request.meta.remoteAddress;
  order.classic = request.params.classic;
  order.sub_classic = request.params.sub_classic;
  order.list_key = request.params.list_key;
  order.owner = request.params.owner;
  order.type = request.params.type;

  if (!(order.ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(order.ip))) {
    order.ip = '127.0.0.1';
  }
  order.tradeType = 'JSAPI';
  order.place().then(() => {
    console.log(`预订单创建成功：订单号 [${order.tradeId}] prepayId [${order.prepayId}]`);
    const payload = {
      appId: process.env.WEIXIN_APPID,
      timeStamp: String(Math.floor(Date.now() / 1000)),
      package: `prepay_id=${order.prepayId}`,
      signType: 'MD5',
      nonceStr: String(Math.random()),
    }
    payload.paySign = wxpay.sign(payload);
    response.success(payload);
  }).catch(error => {
    console.error(error);
    response.error(error);
  });
});

////////////////////////////////////////////////////////////////////////////////////业务API
/**
 *  sharer分享小程序码，sharee点击分享，获得奖励。
 */
AV.Cloud.define('shares', (request, response) => {
  console.log('进入shares流程');
  let date = new Date();
  let share_key = 'sharer_' + request.params.sharer;
  let state_key = 'statement_intergal_' + request.params.sharer + '_share_' + date.getMonth() + date.getDate() + date.getHours() + '_' + date.getTime();
  let state_query_key = 'statement_intergal_' + request.params.sharer + '_share_' + date.getMonth() + date.getDate() + date.getHours() + '*';
  redisClient.keysAsync(state_query_key).then(list => {
    //只有当前小时没有记录的给增加流水记录
    if (list.length == 0) {
      let value = {
        time: date.getTime(),
        content: request.params.content,
        amount: request.params.amount,
        type: '分享'
      };
      let multi = redisClient.multi();
          // multi.ZINCRBY(share_key, 1, request.params.sharee); //给用户集合增加一次邀请记录。
          multi.set(state_key, JSON.stringify(value)); //发放积分奖励的流水
          multi.hget('user_uid', request.params.sharer); //通过对照表查出邀请人的openid
      multi.execAsync().then(function (i) {
        //i[2]是用户openid
        redisClient.HINCRBYAsync('user_' + i[2], 'i_balance', 1).then(x => {
          redisClient.expire(state_key, 6048000);
          response.success('给用户增加积分成功');
        }).catch(() => {
          response.error(error);
        });
      }).catch(() => {
        response.error(error);
      });
    }else{
      //如果用户在这个小时有记录，则直接返回0。
      response.success(0);
    }
  }).catch(console.error);
});



/**
 * 查询用户的所有下线
 */
AV.Cloud.define('query_sharees', (request, response) => {
  redisClient.SMEMBERSAsync('sharees_' + request.params.uid).then(results => {
    for (const result of results) {
      
    }
    let multi = redisClient.multi();
    for (const result of results) {
      multi.hmget(result, 'consume', 'uid', 'nickName', 'image' ,'ages','objectid');
    }
    multi.execAsync().then(function (data) {
      response.success(data);
    }).catch(() => {
      response.error(error);
    });
  }).catch(console.error);
});

/**
 * 分享页面给用户发放奖励。（这个未开发完成。）
 */
AV.Cloud.define('get_share_page_award', (request, response) => {
  console.log('进入get_award流程');
  let {objectid, button} = request.params;
  console.log('我是用户objectid和button',objectid,button);
  //修改redis中的领奖记录，将button的修改为1
  let set_get_reward_record = () => {
      console.log('进入修改redis领奖记录的流程');
      redisClient.hsetAsync('user_' + objectid, button, 1).then((code) => {
        console.log('user_' + objectid, button, code);
        response.success(1);
      }).catch(() => {
        response.error(error);
      });
  }

  //将获奖数据存储到数据库
  let set_to_db = (grade) => {
      console.log('将中奖数据存到数据库。');
      let Rerard = AV.Object.extend('Rerard');
      let reward = new Rerard();
      reward.set('user_key', 'user_' + objectid);
      reward.set('uid', uid);
      reward.set('button', button);
      reward.save().then(function () {
        set_record_status();
      }, function (error) {
        console.error(error);
      });
  }

  //给获奖的用户发红包
  send_red_envelope = (value, desc) => {
    console.log('进入企业付款流程');
    wxpay.wxcompay({
      amount: value,
      openid: objectid,
      desc: desc
    }, function (res) {
      console.log(res);
    });
  }

  //查询用户的中奖情况
  let get_user_get_reward_status = () => {
      redisClient.hgetAsync('user_' + objectid, button).then((code) => {
        console.log('user_' + objectid, button, code);
        if (code != 1) {
          send_red_envelope(30,'领取累计分享/抽奖红包金额为0.3元');//给用户发放红包
          set_to_db(); //将获奖数据存储到数据库
          set_get_reward_record();//修改redis中的领奖记录， 将button的修改为1
        }
      }).catch(() => {
        response.error(error);
      });
  }

  get_user_get_reward_status();
});

/**
 * 查询用户的某个属性
 */
AV.Cloud.define('query_user_field', (request, response) => {
    let {uid,code,field} = request.params;
    let query_user = async () => {
        let objectid = await common.get_field('user_uid', uid);
        if(objectid.slice(-4)==code){
          let result = await common.get_field('user_' + objectid, field);
          response.success(result);
        }else{
          response.success(-1);//鉴权失败
        };
    };
    query_user();
});

/**
 * 定期开奖，中奖后领取奖励
 * record_key: record_key,
   rank: e.currentTarget.dataset.rank,
   uid: app.globalData.userInfo.uid,
    response.success(request.params.code);
 */
AV.Cloud.define('get_lock_award', (request, response) => {
  console.log('进入get_lock_award流程');
  let {uid,record_key,objectid} = request.params;
  //获取中奖信息
  let get_this_phase_winning_code = () => {
    console.log('进入get_this_phase_winning_code流程');
    redisClient.hgetAsync('winning_code', '00000').then((phase) => {
      redisClient.hgetAsync('winning_code', phase).then((winning_code) => {
        get_lottery_record(winning_code)
      }).catch(() => {
        response.error(error);
      });
    }).catch(() => {
      response.error(error);
    });
  }

  //查询获奖信息
  let get_lottery_record = (winning_code) => {
        redisClient.hgetallAsync(record_key).then((i) => {
          let usercode = i.code.split(',');
          let winningcode = winning_code.split(',');
          if (i.get==0) {
              if (usercode[0] == winningcode[0] && usercode[1] == winningcode[1] && usercode[2] == winningcode[2] && usercode[3] == winningcode[3]) {
                set_to_db('特等奖');
                response.success(1);
              } else if (usercode[0] == winningcode[0] && usercode[1] == winningcode[1] && usercode[2] == winningcode[2]) {
                set_to_db('一等奖');
                response.success(2);
              } else if (usercode[0] == winningcode[0] && usercode[1] == winningcode[1]) {
                set_to_db('二等奖');
                response.success(3);
                send_flower(1);
              } else if (usercode[0] == winningcode[0]) {
                set_to_db('三等奖');
                send_red_envelope(30, '您获得极物精选抽奖活动三等奖,奖金0.3元');
                response.success(4);
              } else {
                response.success(0);
              }
          } else {
            response.success(5);//已经发放过奖励
          }
        }).catch(() => {
          response.error(error);
        });
  }
  //中三等奖，给用户发flower
  let send_flower = (amount) => {
        console.log('给用户发Flower');
        redisClient.HINCRBYAsync('user_' + openid, 'f_balance', amount).then(result => {
          console.log('我是result', result);
          response.success(result);
        }).catch(() => {
          response.error(error);
        });
  };

  //给获奖的用户发红包
  send_red_envelope = (value,desc) => {
      console.log('进入企业付款流程');
      wxpay.wxcompay({
        amount: value,
        openid: objectid,
        desc: desc
      }, function (res) {
        console.log(res);
      });
  }
  //将获奖数据存储到数据库
  let set_to_db = (grade) => {
      console.log('将中奖数据存到数据库。');
      let Winning = AV.Object.extend('Winning');
      let winning = new Winning();
      let userkey = 'user_' + objectid;
      winning.set('user_key', userkey);
      winning.set('uid', uid);
      winning.set('commodity',commodity);
      winning.set('grade', grade);
      winning.set('record_key', record_key);
      winning.save().then(function () {
          set_record_status();
      }, function (error) {
        console.error(error);
      });
  }
  //将抽奖记录的get状态修改为已获得。
  let set_record_status = () => {
      redisClient.hsetAsync(record_key, 'get', 1).then(() => {
      }).catch(() => {
        response.error(error);
      });
  }
  get_this_phase_winning_code();
});
/**
 * 时时开奖，中奖后领取奖励
 * record_key: record_key,
   rank: e.currentTarget.dataset.rank,
   uid: app.globalData.userInfo.uid,
    response.success(request.params.code);
 */
AV.Cloud.define('get_unlock_award', (request, response) =>{
  console.log('进入get_unlock_award流程');
  let {uid,record_key,objectid,goods} = request.params;
  //查询获奖信息
  let get_lottery_record = () => {
    redisClient.hgetallAsync(record_key).then((result) => {
      console.log(result);
      if (result.openid != objectid) {
        console.log(result.openid, objectid)
        response.success(-1);
      };
      if (result.get == 0) {
        if (result.win ==1) {
          set_to_db('特等奖');
          response.success(1);
        } else if (result.win == 2) {
          set_to_db('一等奖');
          response.success(2);
        } else if (result.win == 3) {
          set_to_db('二等奖');
          response.success(3);
          send_red_envelope(188, '您获得极物精选抽奖活动二等奖,奖金18.8元');//二等奖，直接发放18.8元红包
        } else if (result.win == 4) {
          set_to_db('三等奖');
          send_red_envelope(30, '您获得极物精选抽奖活动三等奖,奖金0.3元');//3等奖，直接发03.元红包
          response.success(4);
        } else {
          set_to_db('三等奖');
          send_red_envelope(30, '您获得极物精选抽奖活动三等奖,奖金0.3元');
          response.success(0);
        }
      } else {
        response.success(5); //已经发放过奖励
      }
    }).catch(() => {
      response.error(error);
    });
  }

  //中二等奖，给用户发flower
  let send_flower = (amount) => {
    console.log('给用户发Flower');
    redisClient.HINCRBYAsync('user_' + openid, 'f_balance', amount).then(result => {
      console.log('我是result', result);
      response.success(result);
    }).catch(() => {
      response.error(error);
    });
  };

  //给获奖的用户发红包
  send_red_envelope = (value, desc) => {
    console.log('进入企业付款流程');
    wxpay.wxcompay({
      amount: value,
      openid: objectid,
      desc: desc
    }, function (res) {
      console.log(res);
    });
  }

  //将获奖数据存储到数据库
  let set_to_db = (grade) => {
    console.log('将中奖数据存到数据库。');
    let Winning = AV.Object.extend('Winning');
    let winning = new Winning();
    let userkey = 'user_' + objectid;
    winning.set('user_key', userkey);
    winning.set('uid', uid);
    winning.set('goods', goods);
    winning.set('grade', grade);
    winning.set('record_key', record_key);
    winning.save().then(function () {
      set_record_status();
    }, function (error) {
      console.error(error);
    });
  }
  //将抽奖记录的get状态修改为已获得。
  let set_record_status = () => {
    redisClient.hsetAsync(record_key, 'get', 1).then(() => {}).catch(() => {
      response.error(error);
    });
  }
  get_lottery_record();
});
/**
 * 用户点击抽奖
 */
AV.Cloud.define('lottery', (request, response) => {
  console.log('进入lottery流程');
  let {key,openid,uid, pid, type, title, sharer = null, isEnded = null} = request.params;
  let d = new Date();
  let time = d.getTime();
  console.log(uid, pid, sharer);
  // 生成一个code
  create_code = () =>{
      let code = [];
      for (let i = 0; i < 4; i++) {
        code.push(Math.floor(Math.random() * 52));//生成随机数
      } //生成扑克牌；
      return code;
  };
  console.log(create_code());
  console.log(create_code());

  //生成定期开奖记录
  let set_lock_lottery_to_redis = (user,phase,sharer,sharee) => {
    console.log(user, phase, sharee);
    console.log(key);
    let user_code = create_code();
    redisClient.hmsetAsync(key, 'sharer', sharer, 'openid', openid, 'sharee', sharee, 'uid', user, 'phase', phase, 'code', user_code, 'open', 0, 'time', time, 'key', key, 'title', title, 'get', 0).then((i) => {
      redisClient.expire(key, 604800);
      let data = {
        user_code: user_code,
        lottery_record_key: key,
      }
      response.success(data);
    }).catch(() => {
      response.error(error);
    });
  };

  //生成即时抽奖记录
  let set_unlock_lottery_to_redis = (user, sharer, sharee) => {
      //如果存在分享者，那么向分享者发送一个中奖码。
      console.log(user, sharer, sharee);
      console.log(key);
      let user_code = create_code();
      let w_code = create_code();
      redisClient.hmsetAsync(key, 'sharer', sharer, 'openid', openid, 'sharee', sharee, 'uid', user, 'code', user_code, 'w_code', w_code, 'time', time, 'key', key, 'title', title, 'win', win(user_code, w_code),'get', 0).then((i) => {
        redisClient.expire(key, 604800);
        let data = {
          user_code: user_code,
          w_code: w_code,
          lottery_record_key: key,
          win: win(user_code, w_code),
        }
        response.success(data);
      }).catch(() => {
        response.error(error);
      });
  };

  //即时抽奖是否有中奖
  let win = (user_code, w_code) => {
    if (user_code == w_code){
      return 1;
    } else if (user_code[0] == w_code[0] && user_code[1] == w_code[1] && user_code[2] == w_code[2]){
      return 2;
    } else if (user_code[0] == w_code[0] && user_code[1] == w_code[1]) {
      return 3;
    } else if (user_code[0] == w_code[0]) {
      return 4;
    } else{
      return 0;
    }
  };
  //查询下一期的开奖期
  let lock_lottery = (key, field) => {
    redisClient.hgetAsync(key, field).then(phase => {
      if (Boolean(sharer)) {
        set_lock_lottery_to_redis(sharer, phase, null, uid);
      }
      set_lock_lottery_to_redis(uid, phase, sharer, null);
    })
  }
  if(type == 1){
    //即时抽奖
      if (Boolean(sharer)) {
        set_unlock_lottery_to_redis(sharer, null, uid);
      }
      set_unlock_lottery_to_redis(uid, sharer, null);
  }else{
    //定期开奖
    lock_lottery('winning_code', '00000')
  }
});
/**
 * 查询查询一个listing下的所有在售商品
 */
AV.Cloud.define('query_listing_and_goods', (request, response) => {
  console.log('query_listing_and_goods');
  let {list_id} = request.params;
  let query_goods = (listid) => {
    return redisClient.lrangeAsync('goods_list_' + listid,0,-1).then((items_set) => {
      // console.log('我是goods', items_set);
        let multi_goods = redisClient.multi();
        for (const i of items_set) {
          multi_goods.hgetall(i);
        }
        return multi_goods.execAsync().then(function (result) {
          return result;
        });
      })
      .catch(() => {
        console('query_listings_and_goods函数出错');
      });
  }

  let query_listing = (listid) => {
    return redisClient.hgetallAsync('list'+listid).then(listing => {
      return listing;
    });
  }

  let query_listings_and_goods = async (i) => {
    let listing = await query_listing(i);//i 是listid
    let goods = await query_goods(i);
    let value = {
      listing: listing,
      goods: goods,
    }
    // console.log(value);
    response.success(value);
  }
  query_listings_and_goods(list_id); //执行函数
});
/**
 * 查询第三方的商品信息,这段代码是用于查询多个listing，每个listing显示6个good
 */
AV.Cloud.define('query_listings_and_goods', (request, response) => {
  console.log('query_listings_and_goods');
  let {page_index=0} = request.params;

    let query_goods = (index) => {
      return redisClient.lrangeAsync('goods_list_' + index,0,9).then((items_set) => {
          console.log(items_set);
          let multi_goods = redisClient.multi();
          for (const i of items_set) { //这个i是每个商品的key
            multi_goods.hgetall(i);
          }
          return multi_goods.execAsync().then(function (result) {//用filter函数，将空数据清除掉。
            return result.filter(function (item) {
              return item;
            });
          });
        })
        .catch(() => {console.log('query_listings_and_goods函数出错');});
    }

    let query_listings = (index) => {
      return redisClient.lrangeAsync('list_list', index * 10, index * 10 + 9).then(list => {
        console.log('我是list',list);
        let multi = redisClient.multi();
        for (const item of list) {
          multi.hgetall(item)
        };
        return multi.execAsync().then(function (result) {
            return result;
          })
          .catch(() => {
            return false;
          });
      });
    }

    let query_listings_and_goods = async (i) => {
      let data = [];
      let listings = await query_listings(i);//获得5个listings
      for (const listing of listings) {
        console.log('我是listing',listing);
        let goods = await query_goods(listing.list_id);//获得listings下的商品
        let value = {
          listing: listing,
          goods: goods,
          index: i,
        }
        if (goods.length > 4){//如果这个listing下面有4个在售产品，才会显示，不然过滤掉。
            data.push(value);
        }
      }
      // console.log(data);
      response.success(data);
    }
    query_listings_and_goods(page_index);//执行函数
});

/**
 * Scanfromid
 * {key,account}
 */
AV.Cloud.define('scanFromId', (request, response) => {
  console.log('scanFromId');
  let a =0;
  let b = request.params.key;
  let count = request.params.count;
  let f = (a,b) =>{
    redisClient.scanAsync(a, 'MATCH', b, 'COUNT', count).then(data => {
      a = data[0];
      console.log('游标的数据发生了变化，变化后的游标为===',a);
      console.log('游标的数据发生了变化，data[0]===', data[0]);
      for (const i of data[1]) {
        console.log(i);
        common.sendFormMessage(i);
      }
      console.log('我是返回数据的类型，',typeof(a));
      if (a!= '0') {
        console.log('进入了if语句',a);
        //如果游标不为零，代表数据没有遍历结束，继续执行子函数。
        f(a,b);
      }
    }).catch(() => {
      response.error(error);
    });
  }
  f(a,b);
  response.success(1);
});

////////////////////////////////////////////////////////////////////////////以下为活动的云函数

/**
 * 请求的参数是活动的id，通过活动的id，去做一些事情
 */
AV.Cloud.define('query_box_wallet', (request, response) => {
  console.log('query_box_wallet函数，请求参数是活动的id：',request.params.id);
  let new_item = request.params.new_item;
  let act_id = request.params.id;
  let wallet_key = 'box_wallet_' + act_id;
  let d = new Date();
  let item_id = String(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) + String(Math.floor(Math.random() * 9999));
  let item_key = 'box_' + act_id + '_' + item_id;

  let query_wallet = () => {
    //返回集合的一个随机数
    redisClient.srandmemberAsync(wallet_key).then(result => {
        console.log('随机返回的集合的结果',result);
        console.log(typeof(result),result);//这个是itemid
        if(result == null){
          //如果wallet中没有盒子，创建一个盒子
          create_new_item('create_one');
        }else{
          //如果有盒子，返回这个盒子，id:盒子id；result是itemid
          item_key = result;
          query_box_item();
        }
    }).catch(() => {
      response.error(error);
    });
  }

  let query_box_item = () => {
    console.log('查询一个盒子');
    console.log(item_key);
    redisClient.hgetallAsync(item_key).then(data => {
      console.log(data);
      console.log(data.status);
      data.status = JSON.parse(data.status);
      console.log(data.status);
      if (data.status[0] == 1 && data.status[1] == 1 && data.status[2] == 1 && data.status[3] == 1 && data.status[4] == 1 && data.status[5] == 1 && data.status[6] == 1 && data.status[7] == 1 && data.status[8] == 1 && data.status[9] == 1 && data.status[10] == 1 && data.status[11] == 1){
          console.log('盒子已经全部抽完，即将计入新建一个盒子流程')
          create_new_item('create_one'); //创建一个新的item
          del_item(item_key); //将这个list从wallet中删除
      } else {
          let result = {
            status:data.status,
            key:data.key,
          }
          response.success(result);
      }
    }).catch(() => {
      response.error(error);
    });
  }
  //new_item:true ,false ,如果是true，那么是创建一个新的。
  let create_new_item = () => {
    console.log('进入new_item:参数', new_item)
    let status = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let rdm = Math.floor(Math.random() * 10); //生成随机数
    console.log(rdm);
    if (new_item != 'brand_new') {
      console.log('进入if语句');
      for (let i = 0; i < rdm; i++) {
        let j = Math.floor(Math.random() * 12);
        status[j] = 1;
      }
      console.log(status);
    }
    let card = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
    console.log( JSON.stringify(card), JSON.stringify(status));
    redisClient.hmsetAsync(item_key, 'key', item_key, 'card', JSON.stringify(card), 'status', JSON.stringify(status)).then(result => {
      console.log('创建新盒子完成');
      console.log(result,typeof(result));
      if(result == 'OK'){
        //查询这个盒子
        query_box_item();
        //将新建的盒子插入到wallet中。
        redisClient.saddAsync(wallet_key,item_key).then(result => {
            console.log('将新创建的盒子放在wallet中');
        }).catch(() => {
          response.error(error);
        });
      }
    }).catch(() => {
      response.error(error);
    });

  }
  let del_item = () => {
      redisClient.sremAsync(item_key).then(result=>{
        console.log('删除完成抽奖的盒子成功');
      }).catch(() => {
        response.error(error);
      });
  }

  //查询wallet,如果给的参数是新建，则新建全新的。
  if (new_item == 'brand_new') {
      console.log('创建一个全新的盒子')
      create_new_item('brand_new')
  } else if (new_item == 'create_one') {
      create_new_item('create_one')
  }
  else{
      console.log('从wallet中拿出一个盒子');
      query_wallet();
  }
});


/**
 * 用户抽完奖后，更新box
 */
AV.Cloud.define('refresh_box', (request, response) => {
  let query_box_item = (key) => {
    redisClient.hgetallAsync(key).then(data => {
      data.status = JSON.parse(data.status);
      let result = {
        status: data.status,
        key: data.key,
      }
      response.success(result);
    }).catch(() => {
      response.error(error);
    });
  }
  query_box_item(request.params.key);

});

/**
 * 1.随机取出一张卡牌；
 * 2.更新item；
 * 2.生成一个开盒记录;
 * 3.将开盒记录放在开盒列表中；
 * 4.给开盒记录做一个有效期；
 * 
 */
AV.Cloud.define('open_box', (request, response) => {
    console.log(request.params.key)
    let {actkey,itemkey,index,uid,times}= request.params;
    let actinfo = null;
    /**
     * 查找活动
     */
    query_act = () => {
        console.log('查找活动的信息');
        redisClient.hgetallAsync(actkey).then(data => {
          console.log('活动信息')
          console.log(actinfo);
          actinfo = data;
          get_card();//取出卡片
        }).catch(() => {
          response.error(error);
        });
    }
    /**
     * 取出卡牌
     */
    get_card = () => {
        console.log('取出卡片:')
        redisClient.hgetallAsync(itemkey).then(data => {
          console.log(data);
          let status = JSON.parse(data.status);
          console.log('status', status);
          let card = JSON.parse(data.card);
          console.log('card', card);
          status[index] = 1;//标记已经抽奖
          let i = Math.floor(Math.random() * card.length);
          let card_item = card[i];
          console.log('取出的卡片：', card_item);
          console.log('更新后的卡片：',card);
          console.log('更新后的status',status);
          let box_id = itemkey.slice(4, 8) + itemkey.slice(-8);
          let item_id = index+1;
          if (actinfo.x == card_item) {
              if(times > 3){
                card.splice(i, 1);
              }else {
                i = Math.floor(Math.random() * card.length);
                card_item = card[i];
                card.splice(i, 1);
              }
          }
          update_card(JSON.stringify(card), JSON.stringify(status) ,card_item); //更新卡片，返回卡片
          console.log('开盒记录的信息:', actinfo.currency, actinfo.price, actinfo.name, actinfo.share_card, actinfo[card_item], card_item, box_id,item_id);
          create_box_record(actinfo.currency, actinfo.price, actinfo.name, actinfo.share_card, actinfo[card_item], card_item, box_id, item_id); //创建开盒记录
        }).catch(() => {
          response.error(error);
        });
    }
    /**
     * 更新item,更新后，返回抽出的卡片。
     */
    update_card = (card, status, card_item) => {
      console.log('更新卡片信息:', card,status)
      redisClient.hmsetAsync(itemkey, 'card', card, 'status', status).then(result => {
            console.log('返回卡片');
            response.success(card_item);
      }).catch(() => {
            response.error(error);
      });
    }
    /**
     * 生成一个开盒记录
     */
    create_box_record = (currency, price, name, image, card_info, card_item, box_id, item_id) => {
      let t = new Date();
      let tsp = t.getTime();
      let key = 'records_' + tsp;

      let value = {
        type:'开盒记录',
        currency: currency, //什么类型的开盒？ wish  || cash
        amount: price,
        name: name,
        content: currency == 'cash' ? '您参与抽取盲盒活动，消费' + price + '元。' : '您参与心愿抽取盲盒活动，消费' + price + '心愿值。',
        image:image,
        key:key,
        card_info: card_info,
        card_item: card_item,
        box_id: box_id,
        item_id: item_id,
        index:index,
        creat_at:tsp,
      }
      console.log(key);
      console.log(JSON.stringify(value));
      redisClient.setAsync(key, JSON.stringify(value)).then(result => {
          console.log('生成了一个开盒记录:',result);
          console.log(key);
          set_expire(key);
          set_box_record(key);
      }).catch(() => {
        response.error(error);
      });
    }

    let set_expire = (key) => {
      console.log('设置过期时间');
      redisClient.expireAsync(key, 5184000).then(result => {
        console.log('我是获取到的值', result);
        response.success(result);
      }).catch(() => {
        response.error(error);
      });
    }
    /**
     * 将开盒记录放在个人清单下
     */
    let set_box_record = (record_key) => {
      console.log('box_record信息：', 'box_record_' + uid, record_key);
      redisClient.saddAsync('box_record_' + uid, record_key).then(result => {
        console.log('我是result' + result);
        response.success(result);
      }).catch(console.error);
    }
    query_act();
});


/**
 * 查询这个集合是否有五个元素，如果有五个元素，给用户派发奖励
 */
AV.Cloud.define('query_team_result', (request, response) => {
  let key = request.params.key;
  let query_team = () => {
      console.log('进入query_team_result流程');
    return redisClient.SMEMBERSAsync(request.params.key).then(result => {
      console.log(result.length)
      if(result.length < 5){
          response.success(0);
      }else{
        result.map(item =>{
          let team = JSON.parse(item);
          set_wish(team);
        })
          response.success(result);
      }
    }).catch(console.error);
  }
  let set_wish = (item) => {
    console.log('已经有5人参与活动,即将给用户发放奖励');
    console.log('item',item);
    /**
     * 这是组队的一个成员
     * 1.hset 用户表的f_balance 的值，增加48
     */
    return redisClient.hincrbyAsync('user_' + item.objectid,'f_balance',48).then(result => {
        console.log('给用户发放48心愿');
        balance_record(item.objectid,item.uid);
    }).catch(console.error);
  }
  /**
   * 
   */
  let balance_record = (objectid,uid) => {
    console.log('进入，balance_record流程');
    let d = new Date();
    let tsp = d.getTime();
    let time = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2);
    let key = 'records_' + tsp;
    console.log(tsp,time,key,objectid);
    let set_record = () => {
      let value = {
        type: 'in',
        amount: 48,
        name: '组队成功',
        content: '恭喜您参加' + time + '期组队活动获得48心愿',
        key: key,
        time:tsp,
      }
      console.log('生成一个心愿消费记录');
      return redisClient.setAsync(key, JSON.stringify(value)).then(result => {
        set_expire();
        set_wish_record();
      }).catch(console.error);
    }
    let set_expire = () => {
      console.log('设置过期时间60天');
      return redisClient.expireAsync(key, 5184000).then(result => {
          console.log('完成设置过期时间');
      }).catch(console.error);
    }
    let set_wish_record = () => {
      return redisClient.saddAsync('wish_record_' + uid, key).then(result => {
        console.log('将心愿消费的key放在心愿消费记录表中')
      }).catch(console.error);
    }
    set_record();
  }
  query_team();
});


/**
 * 用户积攒后，领取奖励
 * 
 */
AV.Cloud.define('taps_reward', (request, response) => {
  let {
    uid,
    itemid
  } = request.params;
  let d = new Date();
  let today = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //年月日
  let get_or_not = () => {
    return redisClient.hgetAsync('tapsreward', uid + '_' + itemid + '_' + today).then(data => {
      return data
    })
  }
  let set_reward = () => {
    redisClient.hsetAsync('tapsreward', uid + '_' + itemid + '_' + today, 1).then(data => {
      console.log('设置tapsreward完成', data);
    }).catch(() => {
      response.error(error);
    });
    redisClient.hgetAsync('user_uid', uid).then(data => {
      console.log('查询用户的objectid是', data)
      redisClient.hincrbyAsync('user_' + data, 'f_balance', 12).then(data => {
        console.log('完成心愿值的设定');
      }).catch(() => {
        response.error(error);
      });
    }).catch(() => {
      response.error(error);
    });
  }


  let query_massage = async () => {
    let is_get = await get_or_not();
    console.log(is_get);
    if (is_get == null) {
      set_reward(); //
      common.wish_record('点赞', 12, '恭喜您完成点赞获得12心愿', uid);
      response.success(1);
    } else {
      response.success(0);
    }
  }
  query_massage()

});






////////////////////////////////////////////////////////////////////////////可以复用的redis查询api


/**
 * 向redis set  hash key  value=
 * 
 */
AV.Cloud.define('setString', (request, response) => {
  console.log('进入setString流程')
  let {key ,value} = request.params;
  redisClient.setAsync(key, value).then(result => {
    console.log('我是获取到的值', result);
    response.success(result);
  }).catch(() => {
    response.error(error);
  });
});

/**
 * 设置key的过期时间
 */
AV.Cloud.define('setExpireTime', (request, response) => {
  console.log('进入setExpireTime流程');
  let {key ,value} = request.params;
  redisClient.expireAsync(key,value).then(result => {
    console.log('我是获取到的值',result);
    response.success(result);
  }).catch(() => {
    response.error(error);
  });
});

/**
 * 向redis的key中取值
 * 
 */
AV.Cloud.define('getValue', (request, response) => {
  console.log('进入getValue流程');
  redisClient.getAsync(request.params.key).then(result => {
    console.log('我是获取到的值', JSON.parse(result));
    response.success(JSON.parse(result));
  }).catch(() => {
    response.error(error);
  });
});

/**
 * 向redis某个key的feild中设值
 * 
 */
AV.Cloud.define('setField', (request, response) => {
  console.log('进入getField流程');
  let {key,field,value} = request.params;
  redisClient.hsetAsync(key, field, value).then(result => {
    console.log('我是result',result);
    response.success(result);
  }).catch(() => {
    response.error(error);
  });
});
/**
 * 向redis某个key的feild中取值
 * 
 */
AV.Cloud.define('getField', (request, response) => {
  console.log('进入getField流程');
  let {key,field} = request.params;
  redisClient.hgetAsync(key, field).then(result => {
    console.log('我是result', result);
    response.success(result);
  }).catch(() => {response.error(error);});
});


/**
 * increment 某个hash表的某个field
 * 这个是新的。
 */
AV.Cloud.define('increField', (request, response) => {
  console.log('进入increField流程');
  let {key,field,value} = request.params;
  redisClient.HINCRBYAsync(key, field, value).then(result => {
    console.log('我是result', result);
    response.success(result);
  }).catch(() => {
    response.error(error);
  });
});

/**
 * 向redis某个hash表取全部值；
 * 
 */
AV.Cloud.define('getHash', (request, response) => {
  console.log('进入getHash流程');
  console.log(request.params.key)
  redisClient.hgetallAsync(request.params.key).then(result => {
    console.log('我是result',result);
    response.success(result);
  }).catch(() => {response.error(error);});
});

/**
 * hash表中是否有某field；如果result == 1 存在，如果result ==0 不存在
 */
AV.Cloud.define('hasField', (request, response) => {
  console.log('进入hasField流程');
  let {key,field} = request.params;
  redisClient.HEXISTSAsync(key, field).then(result => {
    console.log('我是result');
    console.log(result);
    response.success(result);
  }).catch(() => {
    response.error(error);
  });
});

/**
 * 向redis模糊查询一个hash类型的[],再将列表中的值全部取出；
 * 
 */
AV.Cloud.define('getListItemHash', (request, response) => {
  console.log('进入getListItemHash流程');
  console.log(request.params.key);
  redisClient.keysAsync(request.params.key).then(key => {
    let multi = redisClient.multi();
    for (const i of key) {
      multi.hgetall(i);
    }
    multi.execAsync().then(function (data) {
      console.log('我是data');
      console.log(data);
      response.success(data);
    }).catch(() => {
      response.error(error);
    });
  })
});

/**
 * 参数key:是一个list，将参数的值取出；
 * 
 */
AV.Cloud.define('get_list_hash', (request, response) => {
  console.log('进入getListItemHash流程');
  console.log(request.params.key);
  let multi = redisClient.multi();
  for (const i of request.params.key) {
    multi.hgetall(i);
  }
  multi.execAsync().then(function (data) {
    console.log('我是data');
    console.log(data);
    response.success(data);
  }).catch(() => {
    response.error(error);
  });
});

/**
 * 向redis模糊查询一个string类型的[],再将列表中的值全部取出；
 * 
 */
AV.Cloud.define('getListItemString', (request, response) => {
  console.log('进入getListItemString流程');
  console.log(request.params.key);
  redisClient.keysAsync(request.params.key).then(key => {
    let multi = redisClient.multi();
      for (const i of key) {
        multi.get(i);
      }
    multi.execAsync().then(function (data) {
      console.log('我是data');
      console.log(data);
      response.success(data);
    }).catch(() => {
      response.error(error);
    });
  })
});

/**
 * 向redis模糊查询一个[],并返回长度；
 */
AV.Cloud.define('getListAmount', (request, response) => {
  console.log('进入getListAmount流程');
  console.log(request.params.key)
  redisClient.keysAsync(request.params.key).then(list => {
    console.log('我是List'+ list);
    console.log('我是list.length'+list.length);
    response.success(list.length);
  }).catch(console.error);
});

/**
 * 向redis 的 某个key 设置 集合（set)
 */

AV.Cloud.define('setSet', (request, response) => {
  console.log('进入setSet流程');
  console.log(request.params.key, request.params.value);
  redisClient.saddAsync(request.params.key,request.params.value).then(result => {
    console.log('我是result' + result);
    response.success(result);
  }).catch(console.error);
});

/**
 * redis list 类型数据  删除某个元素
 */

AV.Cloud.define('list_del_item', (request, response) => {
  console.log('list_del_item');
  console.log(request.params.key, request.params.amount,request.params.value);
  redisClient.lremAsync(request.params.key, request.params.amount, request.params.value).then(result => {
    response.success(result);
  }).catch(console.error);
});



/**
 * 删除redis某个set中的值
 */

AV.Cloud.define('delSet', (request, response) => {
  console.log('进入setSet流程');
  console.log(request.params.key, request.params.value);
  redisClient.sremAsync(request.params.key, request.params.value).then(result => {
    console.log('我是result' + result);
    response.success(result);
  }).catch(console.error);
});

/**
 * 向redis 的 某个key 取值 集合（ set)
 */
AV.Cloud.define('getSet', (request, response) => {
  console.log('进入getSet流程');
  console.log(request.params.key)
  redisClient.SMEMBERSAsync(request.params.key).then(result => {
    console.log('我是result' + result);
    response.success(result);
  }).catch(console.error);
});

/**
 * 查询集合中是否有某个值
 */
AV.Cloud.define('existSet', (request, response) => {
  console.log('teamsharee_' + request.params.key);
  console.log(request.params.value);
  redisClient.SISMEMBERAsync('teamsharee_' + request.params.key,request.params.value).then(result => {
    console.log('我是result' + result);
    response.success(result);
  }).catch(console.error);
});


AV.Cloud.define('exist_member', (request, response) => {
  console.log(request.params.key);
  console.log(request.params.value);
  redisClient.SISMEMBERAsync(request.params.key, request.params.value).then(result => {
    console.log('我是result' + result);
    response.success(result);
  }).catch(console.error);
});
/**
 * 取出集合中所有值，返回一个string list
 */
AV.Cloud.define('get_set_item_strings', (request, response) => {
  redisClient.SMEMBERSAsync(request.params.key).then(result => {
      let multi = redisClient.multi();
      for (const i of result) {
        multi.get(i);
      }
      multi.execAsync().then(function (data) {
        data.map(item =>{
          item = JSON.parse(item);
        })
        response.success(data);
      }).catch(() => {
        response.error(error);
      });
  }).catch(console.error);
});
/**
 * 取出集合中所有值， 返回一个hash list
 */
AV.Cloud.define('get_set_item_hash', (request, response) => {
  console.log('进入getSet流程');
  console.log(request.params.key)
  redisClient.SMEMBERSAsync(request.params.key).then(result => {
      let multi = redisClient.multi();
      for (const i of result) {
        multi.hgetall(i);
      }
      multi.execAsync().then(function (data) {
        response.success(data);
      }).catch(() => {
        response.error(error);
      });
  }).catch(console.error);
});

/**
 * 取出集合中所有值， 返回一个hash list
 */
AV.Cloud.define('get_set_item_set', (request, response) => {
  console.log('进入getSet流程');
  console.log(request.params.key)
  redisClient.SMEMBERSAsync(request.params.key).then(result => {
    let multi = redisClient.multi();
    for (const i of result) {
      multi.smembers(i);
    }
    multi.execAsync().then(function (data) {
      response.success(data);
    }).catch(() => {
      response.error(error);
    });
  }).catch(console.error);
});
/**
 * 复合查询向redis模糊查询一个[],并返回长度；
 * 
 */
AV.Cloud.define('getMutiListAmount', (request, response) => {
  console.log('进入getMutiListAmount流程');
  console.log(request.params.key);
  let multi = redisClient.multi();
  for (const i of request.params.key) {
    multi.keys(i);
  }
  multi.execAsync().then(function (data) {
    let value = [];
    for (const i of data) {
      value.push(i.length);
    }
    console.log(value);
    response.success(value);
  }).catch(() => {
    response.error(error);
  });
});

/**
 * 设置redis数据类型为list的数据  尾部插入
 * 向list数据皆为增加一条记录。
 */
AV.Cloud.define('rpush', (request, response) => {
  console.log('进入rpush流程');
  console.log(request.params);
  redisClient.rpushAsync(request.params.key, request.params.value).then(result => {
    console.log(result)
    response.success(result);
  }).catch(console.error);
});


/**
 * 设置redis数据类型为list的数据  在list 头部插入
 */
AV.Cloud.define('lpush', (request, response) => {
  console.log('进入rpush流程');
  console.log(request.params);
  redisClient.lpushAsync(request.params.key, request.params.value).then(result => {
    console.log(result)
    response.success(result);
  }).catch(console.error);
});


/**
 * 将redis 数组的key全部取出，再根据key，取出所有hash值
 * 向list数据皆为增加一条记录。
 */

AV.Cloud.define('get_list_details', (request, response) => {
  console.log('get_list_details');
  console.log(request.params);
  redisClient.lrangeAsync(request.params.key, 0 ,500).then(results => {
      console.log(results)
      let multi = redisClient.multi();
      for (const i of results) {
        multi.hgetall(i);
      }
      multi.execAsync().then(function (data) {
      response.success(data);
      }).catch(() => {
      response.error(error);
      });
      }).catch(console.error);
});

/**
 * 将redis 数组的key全部取出，再根据key，取出所有hash值
 * 向list数据皆为增加一条记录。
 */

AV.Cloud.define('get_list_details_new', (request, response) => {
  console.log('get_list_details');
  console.log(request.params);
  let {key,begin,end} = request.params;
  redisClient.lrangeAsync(key, begin, end).then(results => {
    console.log(results)
    let multi = redisClient.multi();
    for (const i of results) {
      multi.hgetall(i);
    }
    multi.execAsync().then(function (data) {
      response.success(data);
    }).catch(() => {
      response.error(error);
    });
  }).catch(console.error);
});

/**
 * 将redis 数组的key全部取出，再根据key，取出所有hash值
 * 向list数据皆为增加一条记录。
 */

AV.Cloud.define('get_list_item', (request, response) => {
  console.log('get_list_item');
  console.log(request.params);
  let {key,begin,end} = request.params;
  redisClient.lrangeAsync(key, begin, end).then(results => {
      response.success(results);
    }).catch(() => {
      response.error(error);
    });
});


//list 是string类型
AV.Cloud.define('get_list_details_strings', (request, response) => {
  console.log('get_list_details');
  console.log(request.params);
  redisClient.lrangeAsync(request.params.key, 0, 500).then(results => {
    console.log(results)
    let multi = redisClient.multi();
    for (const i of results) {
      multi.get(i);
    }
    multi.execAsync().then(function (data) {
      response.success(data);
    }).catch(() => {
      response.error(error);
    });
  }).catch(console.error);
});
/**
 * 将redis 数组的key全部取出，再根据key，取出所有hash值
 * 向list数据皆为增加一条记录。
 */

AV.Cloud.define('keys', (request, response) => {
  redisClient.keysAsync(request.params.key).then(results => {
      console.log(results)
      response.success(results);
    }).catch(() => {
      response.error(error);
    });
});
/**
 * Scan 数据，通过一个给定的key
 * {key(要筛选的key，比如 'user*'),account(一次性查询多少个),key_type(key的类型，1 string，2 hash，3 set )}
 */
AV.Cloud.define('scan', (request, response) => {
  console.log('scan函数');
  let a = request.params.index;//游标的起始位置
  let b = request.params.key;
  let {count,key_type} = request.params;
  console.log(request.params);
  let f = (a, b) => {
    redisClient.scanAsync(a, 'MATCH', b, 'COUNT', count).then(data => {
      a = data[0];
      //如果key_type == 1  get(i)
      if (key_type == 1){
          let multi = redisClient.multi();
              for (const i of data[1]) {
                multi.get(i);
              }
          multi.execAsync().then(function (result) {
              let data = {
                index: a,
                list: result
              }
              response.success(data);
          }).catch(() => {
            response.error(error);
          });

      } else if (key_type == 2) {
          let multi = redisClient.multi();
              for (const i of data[1]) {
                multi.hgetall(i);
              }
          multi.execAsync().then(function (result) {
            let data = {
              index:a,
              list:result
            }
            response.success(data);
          }).catch(() => {
            response.error(error);
          });
      }
      f(a, b); 
    }).catch(() => {
      response.error(error,b);
    });
  }
  f(a, b);
});




////////////////////////////////////////////////////////////////
/**
 * 以下存放定时函数
 */
/**
 * 发放formid的定时器
 */
AV.Cloud.define('send_formid', function (request) {
  console.log('进入send_formid流程')
  formid.sendFormMessage();
});

/**
 * 每30分钟，将后台商品数据上传到Redis
 */
AV.Cloud.define('upload_goods_info_to_redis', function (request) {
  console.log('进入upload_goods_info_to_redis流程')
  upload_info.upload_goods_info_to_redis();
});
/**
 * 每30分钟，将后台商品列表数据上传到Redis
 */
AV.Cloud.define('upload_goods_list_info_to_redis', function (request) {
  console.log('进入upload_goods_list_info_to_redis流程')
  upload_info.upload_goods_list_info_to_redis();
});



////////////////////////////////////////////////////////////////
/**
 * 以下存放，与业务无关的程序代码
 */

/**
 * 将Commodity表中的数据存为redis hash的数据
 * 目前的数量不足1000，所以不需要迭代数据
 */
AV.Cloud.define('pushCommodityToRedisHash', (request, response) => {
  upload_info.pushCommodityToRedisHash();
});

AV.Cloud.define('pushMallToRedisHash', (request, response) => {
  upload_info.pushMallToRedisHash();
});

AV.Cloud.define('pushBannerToRedisHash', (request, response) => {
  upload_info.pushBannerToRedisHash();
});

/**
 * 将商品的一级目录存到redis 的settings中
 */
AV.Cloud.define('push_catelories_to_redis', (request, response) => {
  upload_info.push_catelories_to_redis();
});

/**
 * 将商品的二级目录存到redis 的settings中
 */
AV.Cloud.define('push_sub_catelories_to_redis', (request, response) => {
  console.log('进入push_sub_catelories_to_redis流程');
  upload_info.push_sub_catelories_to_redis();
});

/**
 * 后台将自营的good表的数据上传到redis中
 */
AV.Cloud.define('upload_goods_info_to_redis_backend', (request, response) => {
  console.log('进入upload_goods_info_to_redis_backend流程');
  upload_info.upload_goods_info_to_redis_backend();
  response.success('完成');
});


/**
 * 将某个redis list中的所有数据下载到后台数据库
 */
AV.Cloud.define('download_goods_info_to_console', (request, response) => {
  console.log('download_goods_info_to_console');
  upload_info.download_goods_info_to_console();
  response.success('完成');
});
/**
 * 后台将自营的list表的数据上传到redis中upload_trial_info_to_redis_backend
 */
AV.Cloud.define('upload_goods_list_info_to_redis_backend', (request, response) => {
  console.log('进入upload_goods_list_info_to_redis_backend流程');
  upload_info.upload_goods_list_info_to_redis_backend();
  response.success('完成');
});

/**
 * 后台将抽奖小样表的数据上传到redis中
 */
AV.Cloud.define('upload_trial_info_to_redis_backend', (request, response) => {
  console.log('upload_trial_info_to_redis_backend');
  upload_info.upload_trial_info_to_redis_backend();
  response.success('完成');
});

/**
 * 后台将抽奖小样表的数据上传到redis中
 */
AV.Cloud.define('upload_actinfo_redis_backend', (request, response) => {
  console.log('upload_actinfo_redis_backend');
  upload_info.upload_actinfo_redis_backend(request.params);
  response.success('完成');
});

/**
 * 后台上传box 的details
 */
AV.Cloud.define('upload_box_details', (request, response) => {
  console.log('upload_box_details');
  upload_info.upload_box_details();
  response.success('完成');
}); 
/**
 * 从后台直接上传商品到redis中
 */
AV.Cloud.define('up_load_list_to_redis_from_execl', (request, response) => {
  console.log('up_load_list_to_redis_from_execl');
  /**
   * 1.将数据上传到redis中
   */
  console.log(request.params.datas)
  let up_goods = (goods) => {
    redisClient.hmsetAsync('list' + goods.list_id,
      'list_id', goods.list_id,
      'key', 'list' + goods.list_id,
      'shop_images', goods.shop_images,
      'shop_desc', goods.shop_desc,
      'shop_name', goods.shop_name).then(result => {
        response.success('完成');
      }).catch((error) => {
        console.log(error);
      });
  }
  up_goods(request.params.datas)
});


/**
 * 从后台直接上传商品到redis中
 */
AV.Cloud.define('up_load_good_to_redis_from_execl', (request, response) => {
  console.log('up_load_good_to_redis_from_execl');
  /**
   * 1.将数据上传到redis中
   */
  console.log(request.params.datas)
  let up_goods = async (goods) => {
    //如果商品没有id，则系统生成一个新的id
    if (goods.id == ''){
      console.log('进入if语句');
      goods.id = await new_goodid();
    }
      console.log(goods.id);
      redisClient.hmsetAsync('gid_' + goods.id,
        'id', goods.id,
        'key', 'gid_' + goods.id,
        'images', goods.images,
        'tags', goods.tags, 
        'trans_fee', goods.trans_fee,
        'commission', goods.commission,
        'share_discount', goods.share_discount,
        'prior', goods.prior,
        'name', goods.name,
        'sub_name', goods.sub_name,
        'remark', goods.remark,
        'content', goods.content,
        'fee', goods.fee,
        'reason', goods.reason,
        'details', goods.details,
        'infors', goods.infors,
        'list_id', goods.list_id,
        'price', goods.price).then(result => {
          up_list(goods.list_id,goods.id)
      }).catch((error) => {
        console.log(error);
      });
    }
  let up_good = () =>{

  }
  let up_list = (list_id, goodid) => {
    console.log('goods_list_' + list_id, 'gid_' + goodid);
    redisClient.rpushAsync('goods_list_' + list_id, 'gid_' + goodid).then(() => {
      response.success('完成');
    });
  }
  let new_goodid = () => {
    return redisClient.hgetAsync('settings','current_good_id').then((goodid) =>{
      redisClient.hincrby('settings', 'current_good_id',1)
      return goodid;
    })
  }
  up_goods(request.params.datas)
});
/**
 * 批量删除KEY
 */
AV.Cloud.define('del_key', (request, response) => {
      redisClient.keysAsync(request.params.key).then(list => {
        console.log(list);
        list.map(item =>{
          redisClient.del(item);
        })
        redisClient.del()
      }).catch(console.error);
  response.success('成功');
});

/**
 * 发送订阅消息
 */
AV.Cloud.define('send_subscribe_message', (request, response) => {
  common.send_subscribe_message();
  response.success('完成');
});


/**
 *   给python客户端传access_token
 */
AV.Cloud.define('get_token', (request, response) => {
      getAccessToken().then(accessToken => {
        console.log(accessToken);
        response.success(accessToken);
      });
});




/**
 *   将微信聊天记录 上传到redis中
 */
AV.Cloud.define('rcv_msg', (request, response) => {
  let { g, s, u, r, c} = request.params;
  console.log(g, s, u, r, c);
  let content = {};
  content.gid = g;
  content.gname = s;
  content.uid = u;
  content.uname = r;
  content.c = c;
  console.log(content);
  common.rpush('msg_'+g,JSON.stringify(content));
  response.success(1)
});

/**
 *   上传微信  数据
 */
AV.Cloud.define('card', (request, response) => {
  let {func = null} = request.params;
  console.log(func)
  if(func == 'goods'){
      let {type,brand,price,msg,time,uid} = request.params;
      redisClient.hmsetAsync('card_' + time, 'type',type,'brand',brand,'price',price,'msg',msg,'time',time,'uid',uid).then(() => {
        common.lpush('mlist_goods',)
        response.success('完成');
      });
  }else if(func == 'card'){
      let {type ,brand ,price ,amount ,time ,uid ,title ,msg} = request.params;
      redisClient.hmsetAsync('card_' + time, 'type',type,'brand',brand,'price',price,'msg',msg,'time',time,'uid',uid,'amount',amount,'title',title).then(() => {
        common.lpush('mlist_card',)
        response.success('完成');
      });
  }else{
    response.success('未完成');
  }
});