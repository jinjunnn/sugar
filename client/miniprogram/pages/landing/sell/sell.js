//发布求购礼品卡的广告


const {
  User,
  Cloud
} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const AV = require('../../../utils/av-live-query-weapp-min');
var app = getApp();
let index = 0;
let sell_list = [];
let list_key = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    add_icon: image.add_image_icon,
    content: null,
    title: null,
    image: null, //商品主图
    checked: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    const paramsJson = {
      key: options.key,
    };
    list_key = options.key;
    wx.setNavigationBarTitle({
      title: options.name,
    });
    console.log(index);
    that.query_list(options.key, index * 20, index * 20 + 19);
  },

  query_list(key,begin,end) {
    let that = this;
    const paramsJson = {
      key: key,
      begin:begin,
      end:end,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
      index++;
      console.log(result);
      sell_list = sell_list.concat(result);
      console.log(sell_list);
      that.setData({
        sell_list: sell_list,
      });
    });
  },

  bind_detail(e){
      console.log(e.currentTarget.dataset.key);
      wx.navigateTo({
        url: '/pages/landing/sell/item/item?key=' + e.currentTarget.dataset.key,
        success: (result) => {},
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    index = 0;
    sell_list = [];
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
      let that = this;
      that.query_list(list_key, index * 20, index * 20 + 19);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})