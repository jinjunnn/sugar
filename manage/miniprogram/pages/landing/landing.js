const {
  User
} = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const AV = require('../../utils/av-live-query-weapp-min');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      arror_icon: image.arror_icon,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.query_settings();
    if (Boolean(app.globalData.settings)) {
      console.log(1)
      that.setData({
        settings: app.globalData.settings,
      });
    } else {
      app.settingsCallback = s => {
        console.log(2)
        that.setData({
          settings: s,
        });
      };
    }
  },

  bind_sell_page(e){
      console.log(e.currentTarget.dataset.key);
      wx.navigateTo({
        url: '/pages/landing/sell/sell?key=' + e.currentTarget.dataset.key + '&name=' + e.currentTarget.dataset.name,
        success: (result) => {},
        fail: () => {},
        complete: () => {}
      });
  },
  
  bind_enquiry_wraps(e) {
    console.log(e.currentTarget.dataset.key);
    wx.navigateTo({
      url: '/pages/landing/enquiry/enquiry?key=' + e.currentTarget.dataset.key,
      success: (result) => {
      },
      fail: () => {},
      complete: () => {}
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

  query_settings() {
    let that = this;
    const paramsJson = {
      key: 'landing_page_settings',
    };
    return AV.Cloud.run('getValue', paramsJson).then((result) => {
      that.setData({
        page_settings: result,
      });
    });
  },

  bind_share(){
    wx.showActionSheet({
      itemList: ['邀请好友之后，好友的每笔交易您都将获得5%的佣金'],
      success(res) {
        wx.navigateTo({
          url: '/pages/user/qrcode/qrcode',
        });
      },
      fail(res) {
        console.log(res.errMsg);
      }
    });
  },

  bind_fans(){
    let that = this;
    wx.showActionSheet({
      itemList: [that.data.page_settings.wechat_group_ad_text],
      success(res) {
        wx.navigateTo({
          url: '/pages/fans/fans',
        });
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
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