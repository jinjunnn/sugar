str.substr(-8)//字符串求后8位








/**
 * 积分抽奖流程
 */
AV.Cloud.define('intergalLottery', (request, response) => {
    console.log('进入积分抽奖流程');

    let objectid = request.params.objectid;
    let commodityid = request.params.commodityid;
    let commodity_name = request.params.commodity_name;
    console.log(objectid)
    console.log(commodityid)
    console.log(commodity_name)
    redisClient.hgetallAsync(objectid).then((user) => {
        try {
            if (user.i_balance < 100) {
                response.success(-1); //积分不足
            } else {
                //进入兑换流程
                let process_result = (result) => {
                    console.log('进入处理数据流程');
                    let d = new Date();
                    let state_key = 'gm_statement_intergal_' + user.uid + '_lottery_' + '_' + d.getTime();
                    let record_key = 'gm_intergal_lottery_' + user.uid + '_' + d.getTime()
                    let value = {
                        time: d.getTime(),
                        content: '参与' + commodity_name + '积分抽奖',
                        amount: -100,
                        type: '积分抽奖'
                    }
                    let multi = redisClient.multi();
                    console.log('objectid==', objectid)
                    console.log('record_key==', record_key)
                    console.log('value.content==', value.content)
                    console.log('state_key==', state_key)
                    console.log(JSON.stringify(value))

                    multi.hincrby(objectid, 'i_balance', -100); //用户的积分账户积分减少100
                    multi.hincrby(objectid, 'i_consume', 100); //用户的积分账户积分减少100
                    multi.hmset(record_key, 'time', d.getTime(), 'content', value.content, 'statement', result); //积分抽奖记录
                    multi.expire(record_key, 6048000) //积分抽奖记录保存一周时间。
                    multi.set(state_key, JSON.stringify(value)); //一条积分流水记录
                    multi.expire(state_key, 6048000) //积分抽奖记录保存一周时间。
                    multi.execAsync().then(function (data) {
                        console.log('323423')
                        if (result != true) {
                            console.log('不中奖');
                            response.success(0);
                        } else {
                            console.log('中奖');
                            response.success(1);
                        }
                    }).catch(() => {
                        response.error(error);
                    });;
                }
                let getRandomIntInclusive = (min, max) => {
                    console.log('进入生成随机数流程');
                    min = Math.ceil(min);
                    max = Math.floor(max);
                    return Math.floor(Math.random() * (max - min + 1)) + min; //含最大值，含最小值 
                }
                let process_lottery = (key) => {
                    console.log('进入抽奖流程');
                    redisClient.hgetallAsync(key).then(commodity => {
                        let probalility = parseInt(commodity.intergal_price * 5 / 100) //设置抽奖的概率
                        let random = getRandomIntInclusive(0, probalility);
                        console.log('我是随机数', random);
                        let result = null;
                        if (result != 8) {
                            result = false;
                            process_result(result);
                        } else {
                            result = true;
                            process_result(result);
                        }
                    }).catch(() => {
                        response.error(error);
                    });
                }
                process_lottery(commodityid)
            }
        } catch (error) {
            response.success(-2); //网络故障
        }
    }).catch(() => {
        response.error(error);
    });
});

  //发布from notice 模板消息
  sendTemplateMessage(formId, openid, date, lotterys, lotterysNew) {
      const data = {
          touser: openid,
          template_id: 'dete4tUeMpwASpZlpEEgnD_VP8PDKetplYYCKAEq758',
          form_id: formId,
          page: 'pages/lottery/lottery',
          data: {
              "keyword1": {
                  "value": lotterys,
              },
              "keyword2": {
                  "value": '今日免费皮肤' + lotterysNew + '抽奖活动已经开启，请点击查看。',
              },
              "keyword3": {
                  "value": '昨日中奖结果已经公布，点击查看中奖名单。',
              },
              "keyword4": {
                  "value": '48小时以内',
              },
          },
          emphasis_keyword: 'keyword1.DATA',
      };
      console.log('send notice: ', data);
      return getAccessToken().then(accessToken => {
          console.log(accessToken)
          axios.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send', data, {
              params: {
                  access_token: accessToken,
              },
          }).then(({
              data
          }) => {
              console.log(data);
          })
      });
  }

  //发布普通模板消息
  sendNotice() {
      if (this.orderMode == 0) {
          const data = {
              touser: this.user.get('authData').weapp_shenhuoquan.uid,
              template_id: '1yQqhgnC5KXVm-f-ja0W5sUGZvSiQU-_YG7Rz1gFdgQ',
              form_id: this.prepayId,
              page: 'pages/lottery/lottery',
              data: {
                  "keyword1": {
                      "value": this.gamename,
                  },
                  "keyword2": {
                      "value": '王者荣耀',
                  },
                  "keyword3": {
                      "value": `${this.amount / 100} 元`,
                  },
                  "keyword4": {
                      "value": '您可以直接加对方游戏ID,赶紧邀请大神吧！',
                  },
              },
              emphasis_keyword: 'keyword1.DATA',
          };
          console.log('send notice: ', data);
          return getAccessToken().then(accessToken =>
              axios.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send', data, {
                  params: {
                      access_token: accessToken,
                  },
              }).then(({
                  data
              }) => {
                  console.log(data);
              })
          );
          return;
      } else {
          const data = {
              touser: this.user.get('authData').weapp_shenhuoquan.uid,
              template_id: 'D4Chi9j3dl-aUdiFLIiHbAP_HYGcxHi-oX9zlUzyBNE',
              form_id: this.prepayId,
              page: 'pages/lottery/lottery',
              data: {
                  "keyword1": {
                      "value": `${this.amount / 100} 元`,
                  },
                  "keyword2": {
                      "value": this.productDescription,
                  },
              },
              emphasis_keyword: 'keyword1.DATA',
          };
          console.log('send notice: ', data);
          return getAccessToken().then(accessToken =>
              axios.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send', data, {
                  params: {
                      access_token: accessToken,
                  },
              }).then(({
                  data
              }) => {
                  console.log(data);
              })
          );
      }
  }