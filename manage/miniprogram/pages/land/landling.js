const common = require('../../model/common');
const image = require('../../image/image');
const AV = require('../../utils/av-live-query-weapp-min');
let app = getApp();
let keys = ['glist_buy_goods','glist_sell_goods','glist_sell_card','glist_pindan','glist_info'];
let titles = ['同行收货', '同行出货', '礼品卡','代刷/拼单','优惠情报'];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sugar_us:'shop_sugar_total_sell_list',
    sugar_jp:'shop_sugar_japan_list',
    sugar_requery:'shop_sugar_requery_list',



    buy_goods:'glist_buy_goods',
    sell_goods:'glist_sell_goods',
    sell_card:'glist_sell_card',
    pindan:'glist_pindan',
    black_list:'glist_black_list',
    goods_info:'glist_goods_info',
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
    if (Boolean(app.globalData.settings)) {
        if(app.globalData.settings.verify==1){
            common.query_user_status(app.globalData.userInfo.status)
        }
        that.setData({
          settings: app.globalData.settings,
          userInfo: app.globalData.userInfo,
        });
    } else {
      app.settingsCallback = s => {
        if(s.verify==1){
            common.query_user_status(app.globalData.userInfo.status)
        }
        that.setData({
          settings: s,
          userInfo: app.globalData.userInfo,
        });
      }
    }
  },


  query_list_key(){
    if(app.globalData.userInfo.status == 3 || app.globalData.userInfo.status == 4){
      wx.showActionSheet({
        itemList: titles,
        success (res) {
          console.log(res.tapIndex);
          console.log(keys[res.tapIndex]);
          let url = '/pages/post/post?key='+keys[res.tapIndex] + '&title=' + titles[res.tapIndex];
          common.navigateTo(url);
        },
        fail (res) {
          console.log(res.errMsg);
        }
      });
    }
    else{
      common.showToast('发布内容需要提交您的微信和手机号码',common.navigateTo('/pages/user/login/login'));
    }
  },

  bind_query_kuaidi(){
    common.showToast('未查询到包裹信息');
  },

  bind_tap(e) {
      common.showToast(e.currentTarget.dataset.information);
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

  },

  bind_nav(e) {
    common.navigateTo(e.currentTarget.dataset.url);
  },
})