//发布求购礼品卡的广告


const {
  User,Cloud
} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const AV = require('../../../utils/av-live-query-weapp-min');
var app = getApp();
let list = null;
let name = null;//商品
Page({
  /**
   * 页面的初始数据
   */
  data: {
    add_icon: image.add_image_icon,
    content: null,
    title: null,
    image: null, //商品主图
    checked:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.query_detail(options.key);

  },

  query_detail(key){
      let that = this;
      const paramsJson = {
        key: key,
      };
      console.log(paramsJson);
      return AV.Cloud.run('getHash', paramsJson).then((x) => {
        console.log(x);
        that.setData({
          list: x,
        });
        wx.setNavigationBarTitle({
          title: x.name,
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

  switch2Change(e){
    console.log(e.detail.value);
    let that = this;
    that.setData({
      checked:e.detail.value,
    })
  },
  /**
   * 
   */
  input_card(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      index: e.detail.value
    });
  },

  bind_submit() {
    console.log(app.globalData.userInfo);
    let that = this;
common.request_subs();
    if (that.data.title == null) {
      common.showToast('请填写商品名称');
    } else if (that.data.content == null) {
      common.showToast('请您填写需求详情');
    } else if (that.data.image == null) {
      common.showToast('请上传需要购买商品的图片');
    } else if (that.data.checked == false) {
      common.showToast('请确认下单须知');
    } else {
      let t = new Date();
      let time = t.getTime();
      let card = 'enquiry_order_' + time;
      that.pay(time,card);
    }
  },

  pay(time,card){
    let that = this;
    wx.showToast({
      title: '正在创建订单',
      icon: 'loading',
      duration: 10000,
      mask: true,
    });
    let paramsJson = {
      productDescription:  '订金:' + that.data.title, //商品名称
      amount: 600, //商品价格 数量是分
      objectid: app.globalData.userInfo.objectid, //用户的objectid
      key: card, //商品id
      username: app.globalData.userInfo.nickName ? app.globalData.userInfo.nickName : null, //用户昵称
      uid: app.globalData.userInfo.uid, //用户id
      sharer: app.globalData.sharer, //分享者
    };
    console.log(paramsJson);
    Cloud.run('order', paramsJson).then((data) => {
      wx.hideToast();
      data.success = () => {
        that.submit_completed(time,card);
        
        console.log('支付成功');
      };
      data.fail = ({
        errMsg
      }) => this.setData({
        error: errMsg
      });
      wx.requestPayment(data);
    }).catch(error => {
      this.setData({
        error: error.message
      });
      wx.hideToast();
    });
  },



  submit_completed(time,card){
      let that = this;
      let data = {};
      data.uid = app.globalData.userInfo.uid;
      data.name = app.globalData.userInfo.nickName;
      data.content = that.data.content;
      data.image = that.data.image;
      data.title = that.data.title;
      data.list_id = that.data.list.id;
      data.list_name = that.data.list.name;
      data.key = card;
      data.time = time;
      console.log(data);
      console.log(card);
      for (let key in data) {
        console.log(key + '---' + data[key]);
        let paramsJson = {
          key: card,
          field: key,
          value: data[key],
        };
        console.log(paramsJson)
        AV.Cloud.run('setField', paramsJson).then((results) => {
          console.log(results);
        }).catch(error => {
          console.log(error)
        });
      }

      let set_card_team = () => {
        let paramsJson = {
          key: that.data.list.wrap_key,
          value: card,
        };
        console.log(paramsJson)
        AV.Cloud.run('lpush', paramsJson).then((results) => {
          console.log(results);
        }).catch(error => {
          console.log(error)
        });
      }

      let set_user_team = () => {
        let paramsJson = {
          key: 'enquiry_user_' + app.globalData.userInfo.uid,
          value: card,
        };
        console.log(paramsJson)
        AV.Cloud.run('lpush', paramsJson).then((results) => {
          console.log(results);
        }).catch(error => {
          console.log(error)
        });
      };
      let nav_back = () => {
        console.log('进入返回上一级流程。')
        wx.navigateTo({
          url: '/pages/user/order/enquiry/enquiry'
        });
      };
      set_card_team();
      set_user_team();
      
      common.showModal('您已经成功提交了代刷请求，如有用户代刷将以服务通知的形式通知您，请确保您同意了开启服务通知。', '提交成功', nav_back);
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