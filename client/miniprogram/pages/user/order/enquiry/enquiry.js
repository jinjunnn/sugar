const {
  User
} = require('../../../../utils/av-live-query-weapp-min');
const common = require('../../../../model/common');
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
    wx.setNavigationBarTitle({
      title: '我的海淘订单'
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    that.query_quote();
  },


  query_quote() {
    let that = this;
    const paramsJson = {
      key: 'enquiry_user_' + app.globalData.userInfo.uid,
    };
    console.log(paramsJson);
    return AV.Cloud.run('get_list_details', paramsJson).then((x) => {
      console.log(x);
      that.setData({
        cards: x,
      });
    })
  },
  bind_detail(e) {
    console.log(e.currentTarget.dataset.key);
    wx.navigateTo({
      url: '/pages/user/order/enquiry/item/item?key=' + e.currentTarget.dataset.key,
      success: (result) => {

      },
      fail: () => {},
      complete: () => {}
    });
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