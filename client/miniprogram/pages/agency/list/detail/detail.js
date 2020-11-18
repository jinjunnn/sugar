const AV = require('../../../../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../../../../utils/av-live-query-weapp-min');
const common = require('../../../../model/common');
const image = require('../../../../image/image');
const app = getApp();

let key ;//商品的key
let sharer = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      home_page: image.qrcode_icon2,
      wrong_icon: image.wrong_icon,
      align_icon: image.align_icon,
      close_icon: image.close_icon,
      share_icon: image.share_icon,
      custom_icon: image.custom_icon,
      add_icon: image.add_icon,
      minus_icon: image.minus_icon,
      backgroundColor: "",
      amount: 1,
      choosed: [0, 0, 0],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    //通过链接进入页面
    if (options.hasOwnProperty('key')) {
      key = options.key;
    } 
    //通过扫码进入页面
    else if(options.hasOwnProperty('scene')) {
      let scene = decodeURIComponent(options.scene);
      let list = scene.split("-")[0];
      let item = scene.split("-")[1];
      sharer = scene.split("-")[2];
      console.log(sharer);
      // key = 'goods_agency_' + list + '_' + item;//
      key = 'gid_' + item;
    }
    /**
     * 如果用户有分享者，下订单时将分享者
     */
    if (options.hasOwnProperty('sharer')){
      console.log('参数中存在sharer');
      sharer = options.sharer;
    }
    wx.setNavigationBarTitle({
      title: '商品详情',
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
    let that = this;
    that.query_goods(key);
    if (Boolean(app.globalData.userInfo)) {} else {
      app.userInfoReadyCallback = u => {}
    }
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
   * 更换商品sku
   */
  bind_change_desc(e) {
    console.log(e.currentTarget.dataset);
    console.log('进入bind_change_desc流程');
    let that = this;
    let choosed = that.data.choosed;
    choosed[Number(e.currentTarget.dataset.label_index)] = e.currentTarget.dataset.desc_index;
    console.log(choosed);
    that.setData({
      choosed: choosed,
    });
  },

  /**
   * 点击购买
   */
  bind_submit() {
    let that = this;
    wx.navigateTo({
      url: '/pages/order/order?key=' + that.data.good.key + '&amount=' + that.data.amount + '&sku=' + that.data.choosed + '&sharer=' + sharer,
    });
  },

  /**
   * 查询商品信息
   */
  query_goods(key) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
    console.log(key)
    let paramsJson = {
      key: key, //商品名称
    };
    console.log(paramsJson);
    AV.Cloud.run('getHash', paramsJson).then((data) => {
      data.images = data.images.split(",");
      if (data.sku){
        data.sku = JSON.parse(data.sku);
      }
      data.commission = parseInt(data.price *5 ) / 100;
      that.setData({
        good: data,
      });
      wx.hideLoading();
    });
  },
  /**
   * 分享
   */
  share() {

  },
  /**
   * 客服
   */
  custom() {

  },
  /**
   * 返回到首页
   */
  goBack() {
    wx.switchTab({
      url: '/pages/lock/lock'
    });
  },
  copy(e) {
    let {
      id
    } = e.currentTarget.dataset;
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
  qr_code(e){
    wx.showActionSheet({
      itemList: ['分享给好友购买可获5元现金红包'],
      success(res) {
          console.log(e);
          console.log(e.currentTarget.dataset.key);
          wx.navigateTo({
            url: '/pages/agency/list/qrcode/qrcode?key=' + e.currentTarget.dataset.key
          });
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })



  },
  /**
   * 获取formid
   */
  formSubmit(e) {
    let that = this;
    let res = {
      key: 'formid_' + app.globalData.userInfo.uid,
      formid: e.detail.formId,
      objectid: app.globalData.userInfo.objectid,
      good_key: that.data.good.key,
      name: that.data.good.name,
    }
    if (e.detail.formIdAllocated) {
      common.formSubmit(res);
    }
  },
  /**
   * 点击购买健，进入弹出模态弹窗
   */
  bind_buy() {
    console.log('进入购买流程');
    let that = this;
    that.showModal();
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
    var animation = wx.createAnimation({
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
    var animation = wx.createAnimation({
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
  share(){
    common.showToast('分享给好友购买您可以获得5元现金红包')
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log(app.globalData.userInfo.uid);
    let that = this;
    let title = that.data.good.price + '元收' + that.data.good.sub_name;
    let path = '/pages/agency/list/detail/detail?sharer=' + app.globalData.userInfo.uid + '&key=' + key; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: title,
      path: path,
      imageUrl: that.data.good.images[0],
      success: function (res) {
        console.log('hahahdsdf');
      },
      fail: function (res) {
        console.log('hahahd');
      },
      complete: function (res) {
        console.log('hahahddd');
      },
    }
  }
})