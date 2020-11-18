const AV = require('../../../utils/av-live-query-weapp-min');
const {
  User,
  Query,
  Cloud
} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();
let sharer = null;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    icon_user: '../../../image/用户.png',
    is_sharer: false, //是需要进入分享者页面么？只有uid 不等于sharer的时候，进入分享者页面
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '积攒活动'
    });
    if (options.hasOwnProperty('sharer')) {
      sharer = options.sharer;
    }
    console.log(sharer);
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.navigateTo({
            url: '/pages/user/login/login'
          });
        }
      }
    });
  },


  /**
   * 生成小程序码
   */
  query_sharees(uid) {
    let that = this;
    const paramsJson = {
      uid: uid,
    };
    console.log(paramsJson);
    AV.Cloud.run('query_sharees', paramsJson).then(results => {
      let inviters = results.filter(item => item[2] != null);
      let arr;
      if (inviters.length < 24) {
        arr = Array(24 - inviters.length);
      } else {
        arr = Array();
      }
      console.log(arr.length);
      that.setData({
        usrs: inviters,
        amounts: inviters.length,
        arr: arr,
        settings:app.globalData.settings,
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
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    let panduan = (uid) => {
      if (sharer == null) {
        that.query_sharees(uid);
      } else if (sharer == uid) {
        that.query_sharees(uid);
      } else {
        that.query_sharees(sharer);
        that.setData({
          is_sharer: true,
        });
      }
    };
    if (Boolean(app.globalData.userInfo)) {
      panduan(app.globalData.userInfo.uid);
    } else {
      app.userInfoReadyCallback = u => {
        panduan(u.uid);
      };
    };
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
    let path = '/pages/share/share?sharer=' + app.globalData.userInfo.uid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: app.globalData.settings.share_page_share_title,
      path: path,
      imageUrl: app.globalData.settings.share_page_share_image,
    };

  }
})