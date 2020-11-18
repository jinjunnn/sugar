const AV = require('../../../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    red_arror_icon: image.red_arror_icon,
    zheng_icon: image.zheng_icon,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({title: '订单列表'});
    let that = this;
    wx.showLoading({title: '加载中'});
    setTimeout(function () {wx.hideLoading();}, 3000);
    if (Boolean(app.globalData.userInfo)) {
        console.log(app.globalData.userInfo.uid,options.type)
        that.query_order(app.globalData.userInfo.uid,options.type);
    } else {
      app.userInfoReadyCallback = u => {
        console.log(u.uid,options.type)
        that.query_order(u.uid,options.type);
      };
    }
  },

  query_order(uid,type){
    let that = this;
    let query = new AV.Query('Order');
    query.equalTo('uid', String(uid));
    query.equalTo('type',Number(type));
    query.doesNotExist('commodity_type');
    query.exists('paidAt');
    query.descending('createdAt');
    query.find().then(function (result) {
      console.log(result);
      that.setData({
        list:result,
      });
      wx.hideLoading();
    });
  },

  button_complete(e){
    console.log(e);
    wx.navigateTo({
      url: '/pages/user/order/item/item?objectid=' + e.currentTarget.dataset.objectid
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