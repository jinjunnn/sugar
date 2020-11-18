const AV = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      add_icon: image.add_image_icon,
      title:null,
      brand:null,
      content:null,
      price:null,
      image:null,
      list_key:'shop_sugar_total_buy'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },


  /**
   * 
   */
  input_wechatid(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      wechatid: e.detail.value
    });
  },
  /**
   * 
   */
  input_title(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      title: e.detail.value
    });
  },
  /**
   * 
   */
  input_phone(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      phone: e.detail.value
    });
  },

  bind_submit() {
    let that = this;
    if (that.data.title == null) {
      common.showToast('请输入您要购买的商品');
    } else if(that.data.wechatid == null) {
      common.showToast('请输入您的微信号');
    } else if(that.data.phone == null) {
      common.showToast('请输入您的手机号码');
    }
    else {
      let t = new Date();
      let time = t.getTime();
      let key = 'info_' + time;
      let data = {};
      data.uid = app.globalData.userInfo.uid;
      data.name = that.data.title;
      if(that.data.image){
        data.image = that.data.image;
      }
      if(that.data.key){
        data.key = key;
      }
      data.id = time;
      console.log(data);
      for (let field in data) {
        console.log(field + '---' + data[field]);
        let paramsJson = {
          key: key,
          field: field,
          value: data[field],
        };
        AV.Cloud.run('setField', paramsJson);
      }

      let set_set = (name, value) => {
        let paramsJson = {
          key: name,
          value: value,
        };
        AV.Cloud.run('lpush', paramsJson);
      }
      set_set('shop_sugar_total_buy_list',key);
      set_set('mlist_' + app.globalData.userInfo.uid,key);
      let url = '/pages/flash/item/item?post=1&title=海淘求购&key=shop_sugar_total_buy_list';
      common.showToast('提交成功', common.navigateTo(url));
    }
  },
  /**
   * 
   */
  bind_images(e) {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '加载中',
        });
        console.log(res.tempFilePaths[0]);
        new AV.File('file-name', {
          blob: {
            uri: res.tempFilePaths[0],
          },
        }).save().then(
          file => {
            console.log(file.attributes.url);
            that.setData({
              image: file.attributes.url
            });
            wx.hideLoading();
          }).catch(console.error);

      }
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