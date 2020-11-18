const AV = require('../../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const app = getApp();
let uid = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    vertical: false,
    previous_margin:"30rpx",
    next_margin: "30rpx",
    current:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.setNavigationBarTitle({
      title: '点赞'
    });
    that.query_acts();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  bind_change(e){
    console.log(e.detail.current);
    let that = this;
    that.setData({
      current: e.detail.current,
    });
    console.log(app.globalData.userInfo.uid, that.data.list[e.detail.current].id);
    that.query_likes(app.globalData.userInfo.uid,that.data.list[e.detail.current].id);
  },

  query_acts() {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    setTimeout(function () {
      wx.hideLoading();
    }, 2000);
    let paramsJson = {
      key: 'likewrap', //活动的key
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
    }).then(()=>{
      console.log("已经完成查询");
      console.log(uid, that.data.list[0].id);
      
        if (Boolean(app.globalData.userInfo)) {
              console.log(app.globalData.userInfo.uid, that.data.list[0].id);
              that.query_likes(app.globalData.userInfo.uid, that.data.list[0].id);
        } else {
          app.userInfoReadyCallback = u => {
            console.log(u.uid, that.data.list[0].id);
              that.query_likes(u.uid, that.data.list[0].id);
          };
    }
    });
  },

  get_reward(){
    let that = this;
    let reward = (uid, itemid) => {
        console.log(uid,itemid);
        let d = new Date();
        let today = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //年月日
        let paramsJson = {
          uid: uid, //活动的key
          itemid: itemid,
        };
        console.log(paramsJson)
        AV.Cloud.run('taps_reward', paramsJson).then((data) => {
          console.log(data);
          wx.showToast({
            title: '12心愿已发放完成',
            icon: 'none',
            duration: 2000
          });
          if(data == 0){
            //
            query_get_reward(uid, itemid);
          }else{

            query_get_reward(uid,itemid);
          }
        });
    }
    let query_get_reward = (uid, itemid) => {
      let that = this;
      let d = new Date();
      let today = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //年月日
      let paramsJson = {
        key: 'tapsreward', //活动的key
        field: uid + '_' + itemid + '_' + today
      };
      console.log(paramsJson);
      AV.Cloud.run('getField', paramsJson).then((data) => {
        console.log(data);
        if (data == null) {
          that.setData({
            get_reward: false,
          });
        } else {
          that.setData({
            get_reward: true,
          });
        }
      });
    }

    reward(app.globalData.userInfo.uid, that.data.list[that.data.current].id);
  },

  query_likes(uid,itemid) {
    console.log('进入查询状态页面');
    let that = this;
    let d = new Date();
    let today = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //年月日
    let paramsJson = {
      key: 'taps_' + uid + '_' + itemid + '_' + today
    };
    console.log(paramsJson);
    AV.Cloud.run('getSet', paramsJson).then((data) => {
      console.log(data);
      if (data == null) {
        //用户没有点赞过
        that.setData({
          amount: 2,
          images: data,
        });
      } else {
        //用户点赞过
        that.setData({
          amount: 2 - data.length,
          images: data,
        });
      }
      if(data.length >= 2){
        query_get_reward(uid,itemid);
      }
    });

    let query_get_reward = (uid,itemid) => {
        let that = this;
        let d = new Date();
        let today = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //年月日
        let paramsJson = {
          key: 'tapsreward', //活动的key
          field: uid + '_' + itemid + '_' + today
        };
        console.log(paramsJson);
        AV.Cloud.run('getField', paramsJson).then((data) => {
          console.log(data);
          if (data == null) {
            that.setData({
              get_reward: false,
            });
          } else {
            that.setData({
              get_reward: true,
            });
          }
        });
    }
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
    console.log(app.globalData.userInfo.uid);
    let that = this;
    let path = '/pages/likes/other?sharer=' + app.globalData.userInfo.uid + '&itemid=' + that.data.list[that.data.current].id; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    console.log(path);
    let image = that.data.list[that.data.current].image;
    console.log(image);
    console.log(that.data.current)
    console.log(that.data.list[that.data.current].share);
    return {
      title: that.data.list[that.data.current].share,
      path: path,
      imageUrl: image,
    };
  }
})