const {
  User,
  Cloud
} = require('../../../../utils/av-live-query-weapp-min');
const common = require('../../../../model/common');
const image = require('../../../../image/image');
const AV = require('../../../../utils/av-live-query-weapp-min');
var app = getApp();
let key = null;
let sharer = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      amount:1,
      home_page: image.qrcode_icon2,
      wrong_icon: image.wrong_icon,
      align_icon: image.align_icon,
      close_icon: image.close_icon,
      share_icon: image.share_icon,
      custom_icon: image.custom_icon,
      add_icon: image.add_icon,
      minus_icon: image.minus_icon,
      choosed: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '产品详情',
    });
    let that = this;
    //如果用户从链接进入
    if (options.hasOwnProperty('key')) {
      key = options.key;
      that.query_detail(options.key);
    }
    //通过扫码进入页面
    else if (options.hasOwnProperty('scene')) {
      let scene = decodeURIComponent(options.scene);
      sharer = scene.split("-")[0];
      key = scene.split("-")[1];
      console.log(sharer);
      console.log(key);
      that.query_detail(key);
    }
    /**
     * 如果用户有分享者，下订单时将分享者
     */
    if (options.hasOwnProperty('sharer')) {
      console.log('参数中存在sharer');
      sharer = options.sharer;
    }

  },

  query_detail(key) {
    let that = this;
    const paramsJson = {
      key: key,
    };
    console.log(paramsJson);
    return AV.Cloud.run('getHash', paramsJson).then((x) => {
      console.log(x);
      x.price = Number(x.price);
      x.images = JSON.parse(x.images);
      if(x.hasOwnProperty('sku')){
        if(x.sku == 'undefined'){
          x.sku = {}
        }else{
          x.sku = JSON.parse(x.sku)
        }
        
      }
      console.log(x);
      that.setData({
        good: x,
      });

    });
  },

  /**
   * 更换商品sku
   */
  bind_change_desc(e) {
    console.log(e.currentTarget.dataset);
    console.log('进入bind_change_desc流程');
    let that = this;
    that.setData({
      choosed: e.currentTarget.dataset.label_index,
    });
  },
  //减少商品数量
  absAmount() {
    var that = this;
    if (that.data.amount > 1) {
      this.setData({
        amount: that.data.amount - 1
      });
    };
  },

  //增加商品数量
  addAmount() {
    let that = this;
    that.setData({
      amount: that.data.amount + 1
    });
  },
    /**
   * 点击购买
   */
  bind_submit() {
    let that = this;
    console.log(that.data.good.key, that.data.amount, app.globalData.sharer)
    wx.navigateTo({
      url: '/pages/landing/sell/order/order?key=' + that.data.good.key + '&amount=' + that.data.amount + '&sharer=' + app.globalData.sharer + '&choosed=' + that.data.choosed,
    });
  },


  bindgetuserinfo(e){
    console.log(123);
    console.log(e);
    if (e.detail.hasOwnProperty('userInfo')) {
      let that = this;
      that.showModal();
    } else {
      common.showToast('购买商品需要授权您的昵称')
    }
  },
  //出现和隐藏弹出框
  showModal: function () {
    // 显示遮罩层
    console.log('显示遮罩层');
    wx.setNavigationBarColor({
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateY(500).step();
    console.log(animation.export());
    this.setData({
      animationData: animation.export(),
      showModalStatus: true,
      backgroundColor: "bg_color",
    });
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200);
  },

  // 隐藏遮罩层
  hideModal: function () {
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateY(500).step();
    this.setData({
      animationData: animation.export(),
      ackgroundColor: "",
    });
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export(),
        showModalStatus: false,
        backgroundColor: "",
      });
    }.bind(this), 200);
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
    that.query_settings()
  },
  copy(e) {
    let { id}  = e.currentTarget.dataset;
    wx.setClipboardData({
      data: id,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log('复制内容为', res.data)
          }
        });
      },
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

  qr_code(e){
    wx.showActionSheet({
      itemList: ['分享给好友购买可获5元现金红包'],
      success(res) {
          console.log(e);
          console.log(e.currentTarget.dataset.key);
              wx.navigateTo({
                url: '/pages/landing/sell/qrcode/qrcode?key=' + e.currentTarget.dataset.key
              });
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  query_settings() {
    let that = this;
    const paramsJson = {
      key: 'settings',
      field: 'about_shop'
    };
    return AV.Cloud.run('getField', paramsJson).then((result) => {
      console.log(result)
      that.setData({
        about_shop: result,
      });
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log(app.globalData.userInfo.uid);
    let that = this;
    let name;
    let path = '/pages/landing/sell/item/item?sharer=' + app.globalData.userInfo.uid + '&key=' + key; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    console.log(name, path, that.data.good.image)
    return {
      name: name,
      path: path,
      imageUrl: that.data.good.image,
    }
  }
})