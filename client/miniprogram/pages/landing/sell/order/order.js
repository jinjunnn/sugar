const AV = require('../../../../utils/av-live-query-weapp-min');
const {
  User,
  Query,
  Cloud
} = require('../../../../utils/av-live-query-weapp-min');
const common = require('../../../../model/common');
const image = require('../../../../image/image');
const app = getApp();
let objectid;
let sharer = null;

let sku_index; //用户下单时选择的sku数组；
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: {},
    arror_icon: image.arror_icon,
    inputValue: '',
    checked: false,
    coupon: 0,
    coins: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    objectid = options.objectid;
    /**
     * 如果用户有分享者，下订单时将分享者
     */
    if (options.hasOwnProperty('sharer')) {
      sharer = options.sharer;
      console.log('我是sharer', sharer);
    }
    that.query_detail(options.key);
    that.setData({
      amount: Number(options.amount), //件数
      choosed: Number(options.choosed),
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '订单支付'
    });

  },

  query_detail(key) {
    let that = this;
    const paramsJson = {
      key: key,
    };
    console.log(paramsJson);
    return AV.Cloud.run('getHash', paramsJson).then((x) => {
      console.log(x);
      x.price = Number(x.price);
      x.fee = Number(x.fee);
      x.images = JSON.parse(x.images);
      if (x.hasOwnProperty('sku')) {
        if (x.sku = 'undefined') {
            x.sku = {}
        } else {
            x.sku = JSON.parse(x.sku);
        }
        
      }
      that.setData({
        good: x,
      });

    });
  },


  query_user_address() {
    wx.showLoading({
      title: '加载中',
      mask: true,
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
          address: results
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
  bind_change(e) {
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
  bind_get_user_address() {
    let value = {};
    wx.chooseAddress({
      success(res) {
        let {
          userName,
          postalCode,
          provinceName,
          cityName,
          countyName,
          detailInfo,
          nationalCode,
          telNumber
        } = res;
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
          key: key,
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
  bind_get_remark(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  bind_submit(e) {
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
    //变更redis中商品的信息，如果在售商品的数量小于0，则把商品从list中取出
    let set_order = () => {
      let paramsJson = {
        key:that.data.good.key,
      };
      Cloud.run('set_order_status', paramsJson).then((data) => {
        console.log(data);
      }).catch(error => {
        console.log(error);
      });
    }
    let sku = '';
    if(that.data.good.hasOwnProperty('sku')){
      if (that.data.good.sku[that.data.choosed]) {
        sku = that.data.good.sku[that.data.choosed].name;
      }
    }else{
      sku = that.data.good.size;
    }
    let paramsJson = {
      productDescription: that.data.good.name, //商品名称
      sku :sku,
      amount: parseInt(price * 100), // order价格
      objectid: app.globalData.userInfo.objectid, //用户的objectid
      key: that.data.good.key, //商品id
      username: app.globalData.userInfo.nickName, //用户昵称
      uid: app.globalData.userInfo.uid, //用户id
      address: that.data.address, //用户地址
      remark: that.data.inputValue, //备注
      trans_fee: that.data.good.fee, //运费
      price: that.data.good.price, //单价
      piece: that.data.amount, //件数
      image: that.data.good.image, //图片
      sharer: app.globalData.sharer, //分享人
      type:2,
    };
    console.log(paramsJson);
    Cloud.run('order', paramsJson).then((data) => {
      wx.hideToast();
      data.success = () => {
        wx.switchTab({
          url: '/pages/user/user'
        });
        set_order();
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