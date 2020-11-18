/**
 * 盲盒活动
 */



const AV = require('../../../utils/av-live-query-weapp-min');
const {
  User,
  Query,
  Cloud
} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();
let key = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
      display:'notload',
      sold_out: image.sold_out,
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.pre_onload();
    if (options.hasOwnProperty('key')) {
      key = options.key;
      that.query_box(key, 'exist_one');
    }else{
      wx.navigateTo({
        url: '/pages/act/act',
      });
    }
    // that.set_act_info();
  },

  pre_onload() {
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.navigateTo({
            url: '/pages/user/login/login'
          });
        } else {
          if (Boolean(app.globalData.userInfo)) {
            that.setData({
              user: app.globalData.userInfo,
            })
          } else {
            app.userInfoReadyCallback = u => {
                that.setData({
                  user: u,
                })
            }
          }
        }
      }
    });
  },


  /**
   * 
   * @param {*} key act的key
   * @param {*} new_item 传递的要创建盒子的信息exist_one:已经有的；create_one：创建一个不是全新的；brand_new:创建一个全新的；
   */
  query_box(key, new_item) {
      let that = this;
      wx.showLoading({
        title: '加载中',
        mask: true,
      });

      setTimeout(function () {
        wx.hideLoading();
      }, 2000);
      let paramsJson = {
        key: key, //活动的key
      };
      AV.Cloud.run('getHash', paramsJson).then((data) => {
        that.setData({
          infors: data,
          display:'load',
        });
        that.query_box_wallet(data.id, new_item);
        
      });
  },
  /**
   * 
   * @param {*} data act:的全部信息；
   * @param {*} new_item //exist_one:已经有的；create_one：创建一个不是全新的；brand_new:创建一个全新的；
   */
  query_box_wallet(id, new_item) {
      console.log(id);//这个是box信息hash表；
      let that = this;
      let paramsJson = {
        id:id, //商品名称
        new_item: new_item,
      };
      console.log(paramsJson);//通过act id 去查询并返回一个box盒子；
      AV.Cloud.run('query_box_wallet', paramsJson).then((box) => {
        console.log(box);
        box.id = box.key.slice(4,8) + box.key.slice(-8);
        that.setData({
          box: box,
        });
        wx.hideLoading();
      });
  },

  /**
   * 如果选择一个已经售出的盒子，显示该盒子已经售出
   */
  bind_notice(){
    wx.showToast({
      title: '此盒已售出',
      icon: 'none',
      duration: 2000
    });
  },


  /**
   * 购买一盒，进入页面
   * @param {} e 
   */
  bind_buy(e){
    console.log(e);
    wx.navigateTo({
      url: '/pages/act/box/item/item?actkey=' + e.currentTarget.dataset.actkey + '&itemkey=' + e.currentTarget.dataset.itemkey + '&index=' + e.currentTarget.dataset.index,
    });
  },
  /**
   * 换一盒
   */
  bind_change(){
    let that = this;
    that.query_box_wallet(that.data.infors.id, 'create_one');
  },
  /**
   * 随机选择一盒
   */
  bind_choose(){
    let that = this;
    that.query_box_wallet(that.data.infors.id, 'brand_new');
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
    if (that.data.hasOwnProperty('box')) {
      that.refresh_page(that.data.box.key);
    }

  },

  /**
   * 更新页面
   */
  refresh_page(item_key){
      let that = this;
      let paramsJson = {
        key:item_key, 
      };
      console.log(paramsJson); //通过act id 去查询并返回一个box盒子；
      AV.Cloud.run('refresh_box', paramsJson).then((box) => {
        console.log(box);
        box.id = box.key.slice(4, 8) + box.key.slice(-8);
        that.setData({
          box: box,
        });
        wx.hideLoading();
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
    let that = this;
    console.log(that.data.infors.link + '&sharer=' + app.globalData.userInfo.uid);
    return {
      title: that.data.infors.content,
      path: that.data.infors.link + '&sharer='+ app.globalData.userInfo.uid,
      imageUrl: that.data.infors.image,
    }
  }

});