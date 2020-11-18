const AV = require('../../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const app = getApp();

let index = 0;//scan 游标的起始位置
let list = [];
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
    that.query_list(index);
  },
  
  query_list(i) {
    let that = this;
    const paramsJson = {
      page_index: i,
    };
    AV.Cloud.run('query_listings_and_goods', paramsJson).then(results => {
      results.map((listing) =>{
        listing.goods.map(good =>{
          good.images = good.images.split(",");
        });
      })
      index++; //用于迭代数组
      list = list.concat(results);
      that.setData({
        list: list,
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
    index = 0; //scan 游标的起始位置
    list = [];
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
    console.log('触底上拉');
    let that = this;
    that.query_list(index);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log(app.globalData.userInfo.uid);
    let title = '组队、抽奖、盲盒、点赞！每天参与活动最高获得200心愿！3天必中大牌香水小样，12天必中MAC口红！';
    let path = '/pages/agency/agency?sharer=' + app.globalData.userInfo.uid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: 'http://lc-XBtceMXX.cn-n1.lcfile.com/0c29fbb152c8808c8f32/WechatIMG2258.jpeg',
    };
  }
})