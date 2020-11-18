const AV = require('../../../../utils/av-live-query-weapp-min');
const {
  User,
  Query,
  Cloud
} = require('../../../../utils/av-live-query-weapp-min');
const common = require('../../../../model/common');
const image = require('../../../../image/image');
const app = getApp();
let actkey = null;
let itemkey = null;
let index = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    backgroundColor: "",
    showModalStatus: false,
    lucky_code:'a',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    wx.setNavigationBarTitle({
      title: 'SUGAR全球快闪店'
    });
    let that = this;
    if (options.hasOwnProperty('itemkey') && options.hasOwnProperty('actkey')) {
      actkey = options.actkey;
      itemkey = options.itemkey;
      index = options.index;
      that.query_box();
    } else {
      wx.navigateTo({
        url: '/pages/act/act',
      });
    }
  },

  query_box() {
    let that = this;
    /**
     * 获取act信息
     * @param {} key 
     */
      let get_act_info = () => {
        let paramsJson = {
          key: actkey,
        };
        AV.Cloud.run('getHash', paramsJson).then((data) => {
          let item_id = itemkey.slice(4, 8) + itemkey.slice(-8) + '-' +String(Number(index) + 1);
          that.setData({
            infors: data,
            index: Number(index) + 1,
            item_id:item_id
          });
        });
      };
      get_act_info(actkey);
      // /**
      //  * 获取item信息
      //  * @param {} key 
      //  */
      // let get_item_info = (key) => {
      //   let paramsJson = {
      //     key: key, 
      //   };
      //   AV.Cloud.run('getCard', paramsJson).then((data) => {
      //     that.setData({
      //       infors: data,
      //       index: Number(index) + 1,
      //     });
      //   });
      // }

  },
  bind_close(){
    let that = this;
    wx.navigateBack({
      delta: 1
    });
  },

  bind_chick(){

  },

  /**
   * 1.查询是cash 模式  还是 wish模式
   */
  bind_buy(){
        wx.showLoading({
          title: '正在抽奖',
          mask:true,
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 5000);

      let that = this;
      let get_act_info = () => {
        let paramsJson = {
          key: actkey,
        };

        AV.Cloud.run('getHash', paramsJson).then((data) => {
            console.log(data);
            if (data.currency == 'cash'){
              that.cash_pay();
            }else if (data.currency == 'wish'){
              that.wish_pay();
            }
        }).catch(error => {
          console.log(error);
        });
      };
      get_act_info();
  },
  /**
   * 1.请求盒子信息，返回值；
   */
  open_box(){
    let that = this;
    console.log(app.globalData.lottery_times);
    let paramsJson ={
      actkey: actkey,
      itemkey: itemkey,
      index: index,
      uid:app.globalData.userInfo.uid,
      times: app.globalData.lottery_times,
    }; 
    console.log(paramsJson);
    AV.Cloud.run('open_box', paramsJson).then((result) => {
      console.log(result);
      let lucky_image = result + '_image';
      that.setData({
        lucky_code:result,
        lucky_image: lucky_image,
      });
      // app.globalData.lottery_times = app.globalData.lottery_times +1;
      wx.hideLoading();
      that.showModal();
    }).catch(error => {
      console.log(error);
    });
  },
  /**
   * 心愿支付
   * 第一步，查询用户的f_balance:  余额
   * @param {} actkey 
   * @param {*} itemkey 
   * @param {*} index 
   */
  wish_pay() {
    console.log('进入wish_pay流程');
    let that = this;
    let price = Number(that.data.infors.price);
    console.log(price);
    // 查询用户心愿余额
    let query_f_balance = () => {
        let paramsJson = {
          key: 'user_' + app.globalData.userInfo.objectid,
          field:'f_balance'
        };
        console.log(paramsJson);
        AV.Cloud.run('getField', paramsJson).then((balance) => {
          console.log('余额：', Number(balance),typeof(balance));
          console.log(Number(balance), Number(that.data.infors.price));
          if (Number(balance) >= Number(that.data.infors.price)) {
            pay();
          } else {
            //如果心愿不足，返回上一页
            that.notice('心愿值不足，请先获得心愿');
            setTimeout(function () {
              wx.navigateBack({
                delta: 1
              });
            }, 2000);

          }
        }).catch(error => {
          console.log(error);
        });
    };
    //余额做减法，
    let pay = () => {
        let paramsJson = {
          key: 'user_' + app.globalData.userInfo.objectid,
          field: 'f_balance',
          value: -price,
        };
        AV.Cloud.run('increField', paramsJson).then((result) => {
          that.open_box(); //余额支付成功，开始开盒
          add_f_consume();//f_consume 增加
          balance_record();//增加消费记录
        });
    } ;
    //增加f_consume
    let add_f_consume = () => {
        let paramsJson = {
          key: 'user_' + app.globalData.userInfo.objectid,
          field: 'f_consume',
          value: price
        };
        AV.Cloud.run('increField', paramsJson).then((result) => {
        });
    };
    /**
     * 1.生成一条余额支出记录，放在 records_{{时间戳}}中，
     * 2.将支出记录放在  wish_record_{{user}}中；
     * 3.wishrecord保存60天；
     */
    let balance_record = () =>{
        let t = new Date();
        let tsp = t.getTime();
        let key = 'records_' + tsp;
        let set_record = () =>{
            let value = {
              type: 'out',
              amount: price,
              name: that.data.infors.name,
              content: '您参与心愿抽取盲盒活动，消费' + price + '心愿值',
              key:key,
            }
            let paramsJson = {
              key: key,
              value: JSON.stringify(value),
            };
            console.log('生成一个心愿消费记录');
            AV.Cloud.run('setString', paramsJson).then((result) => {
              set_expire();
              set_wish_record();
            });
        } 
        let set_expire = () => {
              let paramsJson = {
                key: key,
                value: 5184000,
              };
              console.log('设置过期时间60天');
              AV.Cloud.run('setExpireTime', paramsJson).then((result) => {

              });
        }
        let set_wish_record = () => {
              let paramsJson = {
                key: 'wish_record_' + app.globalData.userInfo.uid,
                value: key,
              };
              console.log('将心愿消费的key放在心愿消费记录表中', paramsJson);
              AV.Cloud.run('setSet', paramsJson).then((result) => {
              });
        }
        set_record()
    }
    query_f_balance();

  },

  /**
   * 如果选择一个已经售出的盒子，显示该盒子已经售出
   */
  notice(title) {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000,
    });
  },

  cash_pay() {
      let that = this;
      wx.showToast({
        title: '正在创建订单',
        icon: 'loading',
        duration: 10000,
        mask: true,
      });
    let pay = () =>{
        let paramsJson = {
          productDescription: that.data.infors.name + '-' + that.data.infors.sub_name, //商品名称
          amount: parseInt(that.data.infors.price * 100), //商品价格 数量是分
          objectid: app.globalData.userInfo.objectid, //用户的objectid
          key: that.data.infors.key, //商品id
          username: app.globalData.userInfo.nickName, //用户昵称
          uid: app.globalData.userInfo.uid, //用户id
          remark: itemkey + '-' + index, //备注
          price: Number(that.data.infors.price), //单价
          image: that.data.infors.image, //图片
          commodity_type:'box',
        };
        Cloud.run('order', paramsJson).then((data) => {
          wx.hideToast();
          data.success = () => {
            /**
             * 支付成功后的业务逻辑
             */
            that.open_box();
            common.incre_amount('user_' + app.globalData.userInfo.objectid, 'consume', parseInt(that.data.infors.price));
            // setTimeout(this.refreshOrders.bind(this), 1500);
            console.log('支付成功');
          };
          data.fail = ({
            errMsg
          }) => this.setData({
            error: errMsg
          });
          wx.requestPayment(data);
        }).catch(error => {
          this.setData({
            error: error.message
          });
          wx.hideToast();
        });
    };
    pay();
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    console.log(that.data.infors.link + '&sharer=' + app.globalData.userInfo.uid);
    return {
      title: that.data.infors.content,
      path: that.data.infors.link + '&sharer=' + app.globalData.userInfo.uid,
      imageUrl: that.data.infors.image,
    }
  },
  //出现和隐藏弹出框
  showModal: function () {
      // 显示遮罩层
      console.log('显示遮罩层');
      //这部分代码是修改 navigationbar颜色的。
      // wx.setNavigationBarColor({
      //   frontColor: '#ffffff',
      //   backgroundColor: '#ff0000',
      //   animation: {
      //     duration: 400,
      //     timingFunc: 'easeIn'
      //   }
      // })
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: "linear",
        delay: 0
      });
      this.animation = animation;
      animation.translateY(500).step();
      console.log(animation.export());
      this.setData({
        animationData: animation.export(),
        showModalStatus: true,
        backgroundColor: "bg_color",
      });
      setTimeout(function () {
        animation.translateY(0).step();
        this.setData({
          animationData: animation.export()
        })
      }.bind(this), 200);
    },

    // 隐藏遮罩层
    hideModal: function () {
      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: "linear",
        delay: 0
      });
      this.animation = animation;
      animation.translateY(500).step();
      this.setData({
        animationData: animation.export(),
        ackgroundColor: "",
      });
      setTimeout(function () {
        animation.translateY(0).step();
        this.setData({
          animationData: animation.export(),
          showModalStatus: false,
          backgroundColor: "",
        });
      }.bind(this), 200);
    }
})