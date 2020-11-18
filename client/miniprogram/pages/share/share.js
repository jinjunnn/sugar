/**
 * 集赞活动
 */


const AV = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const app = getApp();
let sharer = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tapped: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    sharer = options.sharer;
    wx.setNavigationBarTitle({
      title: '积攒活动'
    });

    let that = this;
    if (Boolean(app.globalData.userInfo)) {
      //app.login()已经返回用户id
      that.query_tapped(app.globalData.userInfo.objectid);
    } else {
      app.userInfoReadyCallback = u => {
        that.query_tapped(u.objectid);
      };
    }
  },
  /**
   * 用户是否点赞
   */
  query_tapped(objectid) {
    let that = this;
    let query_sharer = () => {
      let paramsJson = {
        key: 'sharees_' + sharer,
        value: 'user_' + objectid,
      };
      console.log(paramsJson);
      AV.Cloud.run('exist_member', paramsJson).then(result => {
        console.log(result);
        if (result == '1') {
          //用户点赞过
          console.log('用户点赞过');
          that.setData({
            tapped: true,
          });
        } else {
          //用户未点赞过
          console.log('用户未点赞过');
        }
      });
    };
    query_sharer();
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
    that.query_image();
    that.query_product();
  },

  bind_detail_page(e) {
    console.log(e.currentTarget.dataset.link);
    wx.navigateTo({
      url: e.currentTarget.dataset.link,
    });
  },

  bind_likes(e) {
    console.log(e.detail);
    let user = {};
    let that = this;
    let update_user = () => {
      const paramsJson = {
        userinfo: user,
        objectid: app.globalData.userInfo.objectid,
      };
      console.log(paramsJson);
      AV.Cloud.run('getUserInfo', paramsJson).then(function (data) {
        console.log(data);
        app.globalData.userInfo = data;
      }).catch(console.error);
    };
    let tapped_sharer = () => {
      let paramsJson = {
        key: 'sharees_' + sharer,
        value: 'user_' + app.globalData.userInfo.objectid,
      }
      console.log(paramsJson);
      AV.Cloud.run('setSet', paramsJson).then(function (data) {
        console.log(data);
        that.setData({
          tapped: true,
        });
      }).catch(console.error);
    }
    if (e.detail.hasOwnProperty('userInfo')) {
      user = e.detail.userInfo;
      console.log(user);
      update_user();
      tapped_sharer();
    } else {
      wx.showToast({
        title: '点赞需要授权您的头像信息用于展示',
        icon: 'none',
        duration: 3000
      });
    }

  },

  query_image() {
    let that = this;
    let paramsJson = {
      key: 'settings',
    };
    console.log(paramsJson);
    AV.Cloud.run('getHash', paramsJson).then(result => {
      that.setData({
        settings: result,

      });
    });
  },

  query_product() {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    setTimeout(function () {
      wx.hideLoading();
    }, 2000);
    let paramsJson = {
      key: 'other_products', //活动的key
    };
    AV.Cloud.run('get_list_details', paramsJson).then((data) => {
      console.log(data);
      that.setData({
        list: data,
      });
      wx.hideLoading();
    });
  },
  /**
   * 
   */
  nav_to_likes_page() {
    wx.navigateTo({
      url: '/pages/user/invite/other'
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