const AV = require('../../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const app = getApp();

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
    that.query_acts();
  },

  query_acts(){
    let that = this;
      wx.showLoading({
        title: '加载中',
        mask: true,
      });
      setTimeout(function () {
        wx.hideLoading();
      }, 2000);
      let paramsJson = {
        key: 'acts', //活动的key
      };
      AV.Cloud.run('get_set_item_hash', paramsJson).then((data) => {
        console.log(data);
        that.setData({
          list: data.sort((a, b) => {
            if (a.id < b.id) {
              return -1;
            }
            if (a.id > b.id) {
              return 1;
            }
            return 0;
          }), 
          display: 'load',
        });
        wx.hideLoading();
      });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  bind_detail_page(e){
    wx.navigateTo({
      url: e.currentTarget.dataset.link,
    });
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
    console.log(app.globalData.userInfo.uid);
    let title = '组队、抽奖、盲盒、点赞！每天参与活动最高获得200心愿！3天必中大牌香水小样，12天必中MAC口红！';
    let path = '/pages/act/act?sharer=' + app.globalData.userInfo.uid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: 'http://lc-XBtceMXX.cn-n1.lcfile.com/0c29fbb152c8808c8f32/WechatIMG2258.jpeg',
    };
  }
})