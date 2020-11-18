const {
  User
} = require('../../../../../utils/av-live-query-weapp-min');
const common = require('../../../../../model/common');
const image = require('../../../../../image/image');
const AV = require('../../../../../utils/av-live-query-weapp-min');
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
      title: '订单详情'
    });
    console.log(options.key);
    let query_order = (key) => {
      let that = this;
      const paramsJson = {
        key: key,
      };
      console.log(paramsJson);
      return AV.Cloud.run('getHash', paramsJson).then((x) => {
        console.log(x);
        that.setData({
          order: x,
        });
      });
    };
    let query_quote = (key) => {
      let that = this;
      const paramsJson = {
        key: 'q_' + key,
      };
      console.log(paramsJson);
      return AV.Cloud.run('get_list_details', paramsJson).then((x) => {
        console.log(x);
        that.setData({
          cards: x,
        });
      })
    }


    query_order(options.key);
    query_quote(options.key);
  },

  bind_submit(e) {
    console.log(e)
    console.log(e.currentTarget.dataset.index);
    let that = this;
    let accept = (order_uid, quote_uid, orderid, quoteid) => {
      wx.showLoading({
        title: '加载中',
      });
      setTimeout(function () {
        wx.hideLoading();
      }, 3000);
      const paramsJson = {
        order_uid: order_uid,
        quote_uid: quote_uid,
        orderid: orderid,
        quoteid: quoteid,
      };
      console.log(paramsJson);
      return AV.Cloud.run('accept_order', paramsJson).then((x) => {
        console.log(x);
        wx.hideLoading();
        if (x == 1) {
          wx.navigateTo({
            url: '/pages/user/order/accept/accept?orderid=' + orderid + '&quoteid=' + quoteid,
          });
        } else {
          common.showToast('未完成确认');
        }
      });
    }
    wx.showActionSheet({
      itemList: ['同意对方的报价', '再看看'],
      success(res) {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          /**
           * 同意报价需要做哪些事
           * 1.交易双方的用户trading_time增加 1
           * 2. quote 的 accept == 1； wechatid 显示对方的wechatid；
           * 3. order 的 wechatid 显示对方的 wechatid；
           * 4. 给quote 发送一个服务通知
           * 5. 全新的页面，页面内容包含服务双方的信息。
           */
          console.log(that.data.order.uid, that.data.cards[e.currentTarget.dataset.index].uid, that.data.order.key, that.data.cards[e.currentTarget.dataset.index].key)
          accept(that.data.order.uid, that.data.cards[e.currentTarget.dataset.index].uid, that.data.order.key, that.data.cards[e.currentTarget.dataset.index].key)
        }
      },
      fail(res) {
        console.log(res.errMsg);
      }
    })
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