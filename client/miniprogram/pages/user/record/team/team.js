const {
  User
} = require('../../../../utils/av-live-query-weapp-min');
const common = require('../../../../model/common');
const image = require('../../../../image/image');
const AV = require('../../../../utils/av-live-query-weapp-min');
var app = getApp();

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
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#f7d0a6',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
    wx.setNavigationBarTitle({
      title: '组队记录'
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

get_userinfo() {
    let that = this;
    if (Boolean(app.globalData.userInfo)) {
      that.query_wish_list(app.globalData.userInfo);
      that.query_wish(app.globalData.userInfo.objectid);
    } else {
      app.userInfoReadyCallback = u => {
        that.query_wish_list(u);
        that.query_wish(u.objectid);
      };
    }
  },

  query_wish_list(user) {
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    let that = this;
    let paramsJson = {
      key: 'teamlist_' + user.uid,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_set_item_set', paramsJson).then(result => {
      let l1 = [];
      for (const items of result) {
        let l2 = [];
        for (const item of items) {
          l2.push(JSON.parse(item));
        }
        console.log(l2);
        l1.push(l2);
      }
      console.log(l1);
      that.setData({
        record: l1,
        display: true,
        user_image: user.image,
      });
      wx.hideLoading();
    });
  },

  query_wish(objectid) {
    let that = this;
    let paramsJson = {
      key: 'user_' + objectid,
      field: 'f_balance',
    };
    console.log(paramsJson);
    AV.Cloud.run('getField', paramsJson).then(result => {
      that.setData({
        wish: result
      });
      wx.hideLoading();
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
    that.get_userinfo();
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