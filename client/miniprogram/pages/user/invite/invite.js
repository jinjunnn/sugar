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
    icon_user: '../../../image/用户.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我邀请的好友'
    });
  },


  /**
   * 生成小程序码
   */
  query_sharees(uid) {
    let that = this;
    const paramsJson = {
      uid:app.globalData.userInfo.uid
    };
    console.log(paramsJson);
    AV.Cloud.run('query_sharees', paramsJson).then(results => {
      that.setData({
        usrs:results,
        amounts: results.length,
      });
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
    that.query_sharees(app.globalData.userInfo.uid);
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