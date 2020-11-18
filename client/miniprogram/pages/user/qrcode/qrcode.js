const AV = require('../../../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();
let qrcode = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的邀请码'
    });
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
    let that = this;
      that.create_qrcode(app.globalData.userInfo.uid);
  },


  /**
   * 生成小程序码
   */
  create_qrcode(uid) {
        wx.showLoading({
          title: '加载中',
          mask: true,
        });
    let that = this;
    const paramsJson = {
      scene: uid,
      page: 'pages/landing/landing',
      type:'item',
    };
    console.log(paramsJson);
    AV.Cloud.run('getMiniQRCode', paramsJson).then(results => {
      wx.hideLoading();
      let qr_code = wx.arrayBufferToBase64(results.data); //渲染小程序码的代码
      that.setData({
        qr_code: qr_code,
      });
    });
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