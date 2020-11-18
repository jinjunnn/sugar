// 订单页面，目前没有设计好运费模板
const AV = require('../../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const app = getApp();
let sharer = null;

let sku_index;//用户下单时选择的sku数组；
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:{},
    arror_icon: image.arror_icon,
    inputValue:'',
    checked:false,
    coupon:0,
    coins:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    /**
     * 如果用户有分享者，下订单时将分享者
     */
    if (options.hasOwnProperty('sharer')) {
      sharer = options.sharer;
      console.log('我是sharer',sharer);
    }
    sku_index = options.sku.split(',');
    let that = this;
    that.query_goods(options.key);
    that.setData({
      amount: Number(options.amount), //件数
    });
  },


  /**
   * 解析SKU
   */
  parse_sku(index,sku) {
    console.log('进入解析parse_sku流程');
    let sku_params = [];
    for (let i = 0; i < sku.length; i++) {
      const element = sku[i]; //这个是一个标签
      let item = {
        label: element.label,
        desc: element.values[Number(index[i])].desc,
        image: element.values[Number(index[i])].image
      }
      sku_params.push(item);
    }
    return sku_params;
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      wx.setNavigationBarTitle({
        title: '订单详情'
      });

  },

  /**
   * 查询商品信息
   */
  query_goods(key) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    let paramsJson = {
      key: key, //商品名称
    };
    AV.Cloud.run('getHash', paramsJson).then((data) => {
      console.log(3, data);
      let {sku = JSON.stringify([])} = data;
      data.images = data.images.split(",");
      data.list_id = "list_id" in data ? data.list_id : '';
      data.trans_fee = "trans_fee" in data ? parseInt(data.trans_fee) : 20;
      data.sku = that.parse_sku(sku_index, JSON.parse(sku)); //添加id属性
      data.price = Number(data.price); //将价格改为数字
      data.fee = parseInt(data.price * 5) / 100; //代购手续费
      data.tax = 0; //税
      console.log(3,data);
      that.setData({
        good: data,
        user: app.globalData.userInfo
      });
      wx.hideLoading();
    });
  },


  query_user_address() {
    wx.showLoading({
      title: '加载中',
      mask:true,
    });
    if (Boolean(app.globalData.userInfo)) {
      const paramsJson = {
        key: 'address_' + app.globalData.userInfo.uid,
      };
      console.log(paramsJson);
      Cloud.run('getValue', paramsJson).then(results => {
          console.log(results);
          let that = this;
          that.setData({
            address:results
          });
          wx.hideLoading();
      });
    } else {
      app.userInfoReadyCallback = u => {
        const paramsJson = {
          key: 'address_' + u.uid,
        };
        console.log(paramsJson);
        Cloud.run('getValue', paramsJson).then(results => {
            console.log(results);
            let that = this;
            that.setData({
              address: results
            });
            wx.hideLoading();
        });
      };
    }
  },
  /**
   * 
   */
  bind_change(e){
    console.log(e.detail.value);
    let that = this;
    that.setData({
      checked: e.detail.value
    });
  },
  /**
   * 获得用户的地址
   * 
   */
  bind_get_user_address(){
    let value = {};
    wx.chooseAddress({
      success(res) {
        let {userName,postalCode, provinceName,cityName,countyName,detailInfo,nationalCode,telNumber} = res;
         value = {
          userName: userName,
          postalCode: postalCode,
          provinceName: provinceName,
          cityName: cityName,
          countyName: countyName,
          detailInfo: detailInfo,
          nationalCode: nationalCode,
          telNumber: telNumber,
        };
        let key = 'address_' + app.globalData.userInfo.uid;
        let paramsJson = {
          key:key,
          value: JSON.stringify(value)
        };
        Cloud.run('setString', paramsJson).then(result => {
          console.log(result);
        });
      }
    });
  },
  /**
   * 获得用户自己填写的备注信息
   */
  bind_get_remark(e){
    this.setData({
      inputValue: e.detail.value
    })
  },

  bind_submit(e){
      console.log(e);
      let that = this;
      console.log(Number(e.currentTarget.dataset.price));
      that.donate(Number(e.currentTarget.dataset.price));
  },

  //创建购买订单
  donate(price) {
    let that = this;
    wx.showToast({
      title: '正在创建订单',
      icon: 'loading',
      duration: 10000,
      mask: true,
    });
    let paramsJson = {
      productDescription: that.data.good.name + '-' + that.data.good.sub_name,//商品名称
      amount: parseInt(price * 100),//商品价格 数量是分
      objectid: app.globalData.userInfo.objectid,//用户的objectid
      key: that.data.good.key,//商品id
      username: app.globalData.userInfo.nickName,//用户昵称
      uid: app.globalData.userInfo.uid,//用户id
      address: that.data.address,//用户地址
      coupon:that.data.coupon,//抵用券
      remark: that.data.inputValue,//备注
      coins:that.data.coins,//兑换金额
      transmit:that.data.checked,//运送方式  
      fee: that.data.good.fee,//手续费
      trans_fee: that.data.good.trans_fee, //手续费
      price: that.data.good.price,//单价
      piece: that.data.amount, //件数
      image: that.data.good.images[0], //图片
      list_id: that.data.good.list_id, //图片
      sku: that.data.good.sku, //通过
      sharer: sharer, //分享者
    };
    console.log(paramsJson);
    Cloud.run('order', paramsJson).then((data) => {
      wx.hideToast();
      data.success = () => {
        if (that.data.checked == true) {
          console.log('123');
          that.setVip(app.globalData.userInfo.objectid);//如果用户选择了购买会员卡，注册用户为会员
        }
        common.incre_amount('user_' + app.globalData.userInfo.objectid, 'consume', parseInt(price));
        wx.navigateTo({
          url: '/pages/user/order/order'
        });
        setTimeout(this.refreshOrders.bind(this), 1500);
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
  },
  setVip(objectid){
    let paramsJson = {
      key: 'user_'+objectid, //key
      field:'vip',
      value:1,
    };
    console.log(paramsJson);
    Cloud.run('setField', paramsJson).then((data) => {
      console.log(data)
    }).catch(error => {
      console.log(error);
    });
  },
  /**
   * 金币消费流水，保存1个月
   * gm_statement_coin_{{uid}}_lottery_1562599021169
   */
  coin_statement(gameid, price, gamename) {
    let now = new Date();
    let rediskey = 'gm_statement_coin_' + app.globalData.userInfo.uid + '_recharge_' + now.getTime();
    let value = {
      time: now.getTime(),
      content: gamename + '游戏充值',
      type: '游戏充值',
      amount: price,
    };
    let paramsJson = {
      key: rediskey,
      value: JSON.stringify(value)
    };
    console.log(paramsJson);
    AV.Cloud.run('setString', paramsJson).then(() => {
      paramsJson = {
        key: rediskey,
        value: 2592000 * 3
      }
      AV.Cloud.run('setExpireTime', paramsJson);
    });
  },

  //刷新订单，用户完成订单后刷新订单为“success”
  refreshOrders() {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    that.query_user_address();
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

  }
})