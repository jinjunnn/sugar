const AV = require('../../../../../utils/av-live-query-weapp-min');
const {
  User,
  Query,
  Cloud
} = require('../../../../../utils/av-live-query-weapp-min');
const common = require('../../../../../model/common');
const image = require('../../../../../image/image');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    icon_order: image.arror_icon,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '订单详情'
    });
    let that = this;
    that.query_order(options.objectid);
  },


  query_order(objectid) {
    let that = this;
    let query = new AV.Query('Order');
    query.get(objectid).then(function (order) {
      console.log(order.attributes.status);
      console.log(that.set_trans_status(order.attributes.status));
      let tax = Number(order.attributes.price * 11) / 100;

      let discount = 39 + tax + order.attributes.fee;
      console.log(tax);
      that.setData({
        order: order,
        tax: tax,
        discount: discount.toFixed(2),
        trans_status: that.set_trans_status(order.attributes.status),
      });
    });
  },

  set_trans_status(status) {
    if (status == 'SUCCESS') {
      return {
        status: '商品采购中',
        process: '商品采购中，请耐心等待',
        time: '2019-12-12 17:35:53'
      }
    } else if (status == 'TRANS_THREE_PART') {
      return {
        status: '商品出关',
        process: '您的商品已经采购完成，等待出关',
        time: '2019-12-12 17:35:53'
      }
    } else if (status == 'TRANS_TO_CHINA') {
      return {
        status: '国际运输中',
        process: '您的商品正在国际运输中，请耐心等待',
        time: '2019-12-12 17:35:53'
      }
    } else if (status == 'CHINA_COMTOM') {
      return {
        status: '商品入关',
        process: '您的商品正在海关入关中',
        time: '2019-12-12 17:35:53'
      }
    } else if (status == 'TRANS_TO_DOOR') {
      return {
        status: '国内寄送中',
        process: '您的商品正在国内快递运输中，请耐心等待包裹',
        time: '2019-12-12 17:35:53'
      };
    }
  },

  /**
   * 生成小程序码
   */
  create_qrcode(uid) {
    let that = this;
    const paramsJson = {
      scene: uid,
      page: 'pages/agency/agency',
      type: 'item',
    };
    console.log(paramsJson);
    AV.Cloud.run('getMiniQRCode', paramsJson).then(results => {
      let qr_code = wx.arrayBufferToBase64(results.data); //渲染小程序码的代码
      that.setData({
        qr_code: qr_code,
      });
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    console.log(app.globalData.userInfo.uid);
    that.create_qrcode(app.globalData.userInfo.uid);
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

  }
})