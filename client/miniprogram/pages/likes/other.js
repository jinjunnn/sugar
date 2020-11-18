const AV = require('../../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../../utils/av-live-query-weapp-min');
const common = require('../../model/common');
const image = require('../../image/image');
const app = getApp();
let enquiry_wraps = 'enquiry_wraps'; //询价列表
let onroad_goods_wraps = 'onroad_goods_wraps'; //在途列表
let spot_goods_wraps = 'spot_goods_wraps';
let futures_goods_wraps = 'futures_goods_wraps';
let sharer;
let itemid;
let uid = null;
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
    let that = this;
    console.log(options);
    sharer = options.sharer;
    itemid = options.itemid;
    that.login();
    that.query_item();
    that.query_settings();
    if (Boolean(app.globalData.settings)) {
      that.setData({
        settings: app.globalData.settings,
      });
    } else {
      app.settingsCallback = s => {
        that.setData({
          settings: s,
        });
      };
    }
  },


  nav_to_likes_page(){
    wx.switchTab({
      url: '/pages/likes/likes'
    });
  },

  query_status(){
    console.log('进入查询状态页面');
    //查询 用户是否为这个用户
    let that = this;
    let d = new Date();
    let today = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //年月日
    let paramsJson = {
      key: 'likes_hash', //活动的key
      field:sharer + '_' + uid + '_' + itemid + '_' + today
    };
    console.log(paramsJson);
    AV.Cloud.run('getField', paramsJson).then((data) => {
      console.log(data);
      if (data==null) {
        //用户没有点赞过
        that.setData({
          status:1,
        });
      } else {
        //用户点赞过
        that.setData({
          status: 2,
        });
      }
    });
  },

  login() {
    console.log('进入登录流程')
    let that = this;
    //查询用户是否已经点赞过用户  
    let query_tap_uid = () => {
      console.log('查询用户是否点赞')
      let that = this;
      let paramsJson = {
        key: 'tap_' + sharer, //活动的key
        field: uid,
      };
      console.log(paramsJson);
      AV.Cloud.run('getField', paramsJson).then((data) => {
        console.log('查询用户是否点赞的结果', data);
        //如果用户没有点赞过用户
       that.setData({taped:data,})
      }).then(() => {
        console.log('已经处理完成')
      });
    };
    wx.login({
      success: res => {
        let paramsJson = {
          code: res.code,
          sharer: sharer,
        };
        console.log(paramsJson);
        AV.Cloud.run('login', paramsJson).then(function (user) {
            uid = user.uid;
            if (sharer == uid) {
              that.nav_to_likes_page();
            } else {
              that.query_status();
              that.query_likes();
              query_tap_uid();
            }
        }).then(() => {
        }).catch(console.error);
      }
    });
  },


  /**
   * 查询点赞的数量
   */
  query_likes() {
    let that = this;
    let paramsJson = {
      key: 'taps_' + sharer + '_' + itemid + '_' + common.get_full_time()
    };
    console.log(paramsJson);
    AV.Cloud.run('getSet', paramsJson).then((data) => {
      console.log(data);
      if (data == null) {
        //用户没有点赞过
        that.setData({
          amount: 4,
          images:data,
        });
      } else{
        //用户点赞过
        that.setData({
          amount: 4-data.length,
          images:data,
        });
      }
    });
  },
  /**
   * 查询点赞的项目
   */
  query_item(){
    let that = this;
    let paramsJson = {
      key: 'like_'+itemid, //活动的key
    };
    console.log(paramsJson);
    AV.Cloud.run('getHash', paramsJson).then((data) => {
      console.log(data);
      that.setData({
        item:data,
      });
    });
  },


  /**
   * 点赞用户
   */
  bind_likes(){
    //点赞用户；
    let set_image = () => {
          let that = this;
          let d = new Date();
          let today = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //年月日
          let paramsJson = {
            key: 'taps_' + sharer + '_' + itemid + '_' + today,
            value:app.globalData.userInfo.image,
          };
          console.log(paramsJson);
            AV.Cloud.run('setSet', paramsJson).then((data) => {
              console.log('我是setSet的结果',data);
              common.showToast('您已完成对好友点赞')
              that.query_status();
              that.query_likes();
          });
    };
    //将点赞的信息，放到hash表中，
    let set_hash = () => {
          let that = this;
          let d = new Date();
          let today = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //年月日
          let paramsJson = {
            key: 'likes_hash', //活动的key
            field: sharer + '_' + uid + '_' + itemid + '_' + today,
            value:1
          };
          console.log(paramsJson);
            AV.Cloud.run('setField', paramsJson).then((data) => {
             console.log(data);
             set_image();
          });
    };
    //这个设置用户已经帮助过这个用户点赞；
    let tap_uid = () => {
          let that = this;
          let d = new Date();
          let today = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //年月日
          let paramsJson = {
            key: 'tap_' + sharer, //活动的key
            field: uid,
            value: 1
          };
          console.log(paramsJson);
           AV.Cloud.run('setField', paramsJson).then((data) => {
             console.log(data);
            set_hash();
          });
    }

    //查询用户是否已经点赞过用户  
    let query_tap_uid = () => {
          console.log('查询用户是否点赞')
          let that = this;
          let d = new Date();
          let today = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //年月日
          let paramsJson = {
            key: 'tap_' + sharer, //活动的key
            field: uid,
          };
          console.log(paramsJson);
          AV.Cloud.run('getField', paramsJson).then((data) => {
            console.log('查询用户是否点赞的结果',data);
            //如果用户没有点赞过用户
            if(data == null){
              tap_uid();
            }else{
              // 显示提示框
              wx.showModal({
                title: '您已经点赞过好友',
                content: '每期每个用户只能点赞一次好友。',
                success(res) {
                  if (res.confirm) {
                    wx.switchTab({
                      url: '/pages/likes/likes'
                    });
                  } else if (res.cancel) {
                    wx.switchTab({
                      url: '/pages/likes/likes'
                    });
                  }
                }
              })
            }
          }).then(() =>{
            console.log('已经处理完成')
          });
    }
    query_tap_uid();
  },

  bind_sell_page(e){
      console.log(e.currentTarget.dataset.key);
      wx.navigateTo({
        url: '/pages/landing/sell/sell?key=' + e.currentTarget.dataset.key,
        success: (result) => {},
        fail: () => {},
        complete: () => {}
      });
  },
  
  bind_enquiry_wraps(e) {
    console.log(e.currentTarget.dataset.key);
    wx.navigateTo({
      url: '/pages/landing/enquiry/enquiry?key=' + e.currentTarget.dataset.key,
      success: (result) => {
      },
      fail: () => {},
      complete: () => {}
    });
  },
  bind_sell_page(e){
      console.log(e.currentTarget.dataset.key);
      wx.navigateTo({
        url: '/pages/landing/sell/sell?key=' + e.currentTarget.dataset.key + '&name=' + e.currentTarget.dataset.name,
        success: (result) => {},
        fail: () => {},
        complete: () => {}
      });
  },
  
  bind_enquiry_wraps(e) {
    console.log(e.currentTarget.dataset.key);
    wx.navigateTo({
      url: '/pages/landing/enquiry/enquiry?key=' + e.currentTarget.dataset.key,
      success: (result) => {
      },
      fail: () => {},
      complete: () => {}
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

  query_settings() {
    let that = this;
    const paramsJson = {
      key: 'landing_page_settings',
    };
    return AV.Cloud.run('getValue', paramsJson).then((result) => {
      that.setData({
        page_settings: result,
      });
    });
  },

  bind_share(){
    wx.showActionSheet({
      itemList: ['邀请好友之后，好友的每笔交易您都将获得5%的佣金'],
      success(res) {
        wx.navigateTo({
          url: '/pages/user/qrcode/qrcode',
        });
      },
      fail(res) {
        console.log(res.errMsg)
      }
    });
  },

  bind_fans(){
    let that = this;
    wx.showActionSheet({
      itemList: [that.data.page_settings.wechat_group_ad_text],
      success(res) {
        wx.navigateTo({
          url: '/pages/fans/fans',
        });
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    uid = null;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    uid = null;
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
    let title = '点赞我的心愿，送你72心愿抽皮肤盲盒。';
    let path = '/pages/likes/other?sharer=' + sharer + '&itemid=' + itemid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    console.log(path);
    let image = that.data.item.image;
    console.log(image);
    return {
      title: title,
      path: path,
      imageUrl: image,
    };
    }

})