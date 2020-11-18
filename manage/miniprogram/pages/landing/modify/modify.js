const AV = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();
let list_key;

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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let {key=null} = options;
      list_key = key;
      let that = this;
      that.setData({
        list_key:list_key,
        name:options.title,
      });
  },


  /**
   * 
   */
  input_price(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      price: e.detail.value
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
  input_content(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      content: e.detail.value
    });
  },

  /**
   * 
   */
  input_brand(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      brand: e.detail.value
    });
  },

  query_post_mode(title) {
    switch (title) {
      case 'glist_buy_goods':
        return 1;
      case 'glist_sell_goods':
        return 2;
      case 'glist_sell_card':
        return 3;
      case 'glist_pindan':
        return 4;
      case 'glist_info':
        return 5;
      case 'glist_black_list':
        return 6;
      default:
        return 0;
    }
  },

  bind_submit() {
    let that = this;
    if (that.data.title == null) {
      common.showToast('请输入标题');
    }else {
      let t = new Date();
      let time = t.getTime();
      let key = 'info_' + time;
      let data = {};
      data.uid = app.globalData.userInfo.uid;
      data.title = that.data.title;
      if(that.data.content){
        data.content = that.data.content;
      }
      if(that.data.price){
        data.price = that.data.price;
      }      
      if(that.data.brand){
        data.brand = that.data.brand;
      }
      if(that.data.image){
        data.image = that.data.image;
      }
      if(that.data.key){
        data.key = key;
      }
      data.time = time;
      data.status = 0;
      data.mode = that.query_post_mode(list_key)
      console.log(data);
      for (let field in data) {
        console.log(field + '---' + data[field]);
        let paramsJson = {
          key: key,
          field: field,
          value: data[field],
        };
        AV.Cloud.run('setField', paramsJson).then((results) => {
          console.log(results);
        }).catch(error => {
          console.log(error)
        });
      }

      let set_set = (name,value) => {
        let paramsJson = {
          key: name,
          value: value,
        };
        console.log(paramsJson);
        AV.Cloud.run('lpush', paramsJson).then((results) => {
          console.log(results);
        }).catch(error => {
          console.log(error);
        });
      }

      let increase_users_field = (field,value) => {
        let paramsJson = {
          uid:app.globalData.userInfo.uid,
          code:app.globalData.userInfo.code,
          field: field,
          value: value,
        };
        console.log(paramsJson);
        AV.Cloud.run('increase_users_field', paramsJson).then((results) => {
          console.log(results);
        }).catch(error => {
          console.log(error);
        });
      }

      set_set(that.data.list_key,key);
      set_set('mlist_' + app.globalData.userInfo.uid,key);
      increase_users_field('deposit',1);
      let url = '/pages/list/list?key='+that.data.list_key + '&title=' + that.data.name;
      console.log(url);
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
      list_key = null;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
      list_key = null;
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