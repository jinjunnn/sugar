const {
  User
} = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const AV = require('../../utils/av-live-query-weapp-min');
var app = getApp();

Page({
  data: {
    display:false,
    icon_box: image.box,
    icon_team: image.team,
    icon_arrow: image.arror_icon,
    icon_lottery: image.lottery,
    icon_order: image.icon_order,
    icon_fuwu: image.fuwu,
    icon_lipinka: image.lipinka,
    icon_hezuo: image.hezuo,
    icon_yongjin: image.yongjin,
    icon_qrcode:image.qrcode_icon,
    icon_invite:image.invite_icon,
    icon_coins: '../../image/我的钱包.png',
    icon_intergal: '../../image/积分.png',
    icon_key: '../../image/花.png',
    icon_user: '../../image/用户.png',
    icon_service: '../../image/客服.png',
    referee: '',
    wallet: '',
    order: '',
    notice: '',
    referee: '',
    userimage: '',
    referee: '',
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '我的'
    });
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.navigateTo({
            url: './login/login'
          });
        }
      }
    });
  },
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '我的'
    });
    wx.showLoading({
      title: '加载中',
      mask:true,
    });
    let that = this;
    if (Boolean(app.globalData.settings)) {
      console.log(1)
      that.setData({
        settings: app.globalData.settings,
      });
    } else {
      app.settingsCallback = s => {
        console.log(2)
        that.setData({
          settings: s,
        });
      }
    }
    if (Boolean(app.globalData.userInfo)) {
      let paramsJson = {
        key: 'user_' + app.globalData.userInfo.objectid,
      };
      console.log(paramsJson);
      AV.Cloud.run('getHash', paramsJson).then(x => {
        wx.hideLoading();
        that.setData({
          user: x,
          display:true,
        });
      });
    } else {
      app.userInfoReadyCallback = u => {
        wx.hideLoading();
        that.setData({
          user: u, display: 
          true,
        });
      };
    }
  },

  /**
   * 未完成的功能
   */
  setting() {
    wx.showModal({
      title: '通知',
      content: '金币、积分、心愿兑换皮肤道具大礼即将开启，请您耐心等待。',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    });
  },

  /**
   * 进入积分页面
   */
  bind_nav_intergal() {
    wx.navigateTo({
      url: './intergal/intergal',
    });
  },

  
  bind_sell_order() {
    wx.navigateTo({
      url: './order/sell/sell',
    });
  },
  /**
   * 进入抽奖记录
   */
  bind_lock_record(){
    wx.navigateTo({
      url: './lock/record',
    });
  },
  bind_customer_service() {
    let that = this;
    that.showModal(6);
  },


  bind_close() {
    console.log(124)
    let that = this;
    that.hideModal();
  },
  //出现和隐藏弹出框
  showModal: function (status) {
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
      showModalStatus: status,
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
        showModalStatus: 0,
        backgroundColor: "",
      });
    }.bind(this), 200);
  },


  /**
   * 邀请页面
   */
  bind_invite() {
    wx.navigateTo({
      url: './invite/invite',
    });
  },

  bind_enquiry_order(){
      wx.navigateTo({
        url: './order/enquiry/enquiry',
      });
  },

  bind_invite_other() {
    wx.navigateTo({
      url: './invite/other',
    });
  },
  /**
   * 小程序码页面
   */
  bind_qrcode(e){
    wx.showActionSheet({
      itemList: ['邀请好友之后，好友的每笔交易您都将获得5%的佣金'],
      success(res) {
          wx.navigateTo({
            url: './qrcode/qrcode',
          });
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  /**
   * 进入心愿页面
   */
  bind_nav_wish() {
    wx.switchTab({
      url: './wish/wish',
    });
  },
  /**
   * 礼品卡
   */
  bind_nav_giftcard() {
    wx.navigateTo({
      url: '/pages/giftcard/giftcard',
    });
  },

  /**
   * 进入订单页面
   */
  bind_order(e) {
    common.navigateTo('/pages/user/order/order?type='+e.currentTarget.dataset.type);
  },
  /**
   * 进入抽盒记录
   */
  bind_box() {
    wx.navigateTo({
      url: '/pages/user/record/box/box',
    });
  },


  /**
   * 进入抽盒记录
   */
  bind_team() {
    wx.navigateTo({
      url: '/pages/user/record/team/team',
    });
  },

  /**
   * 进入抽盒记录
   */
  bind_balance() {
    wx.navigateTo({
      url: '/pages/user/coin/record',
    });
  },

  /**
   * 进入抽盒记录
   */
  bind_intergal() {
    wx.navigateTo({
      url: '/pages/user/intergal/record',
    });
  },

  /**
   * 进入抽盒记录
   */
  bind_wish() {
    wx.navigateTo({
      url: '/pages/user/wish/record',
    });
  },
  /**
   * 
   */
  bind_marketting(){
    wx.navigateTo({
      url: './marketing/marketing',
    });
  },

  /**
   * 买手服务
   */
  bind_buyer_service(){
    wx.navigateTo({
      url: './buyer/buyer',
    });
  },

  /**
   * 推手服务
   * 用户在平台上累计成功下单六次，可以成为推手
   * 成为推手后，通过推广链接其他用户购买的，给予3%的返现，返现到金币账户中。
   * 用户需要点击申请成为推手后，才能够成为推手。
   */
  bind_agency_service(){
    wx.navigateTo({
      url: './agency/agency',
    });
  }
});

