const AV = require('./utils/av-live-query-weapp-min');
let userinfo;
let sharer;

AV.init({
  appId: 'XBtceMXXkxxRQez6lQBCJ8UK-gzGzoHsz',
  appKey: 'NyBX6PcqQVnQAEKfUKmgtpjx',
});

App({
  onLaunch: function (options) {
    console.log(options);
    if (options.query.hasOwnProperty('sharer')) {
      sharer = options.query.sharer;
    }
    if (options.query.hasOwnProperty('scene')) {
      sharer = decodeURIComponent(options.query.scene);
    }
    console.log(sharer);
    let that = this;
    that.login(sharer);
    that.verify();
  },


  /**
   * 审核
   */
  verify() {
    let that = this;
    let s = {};
    let paramsJson = {
      key: 'settings',
    };
    AV.Cloud.run('getHash', paramsJson).then(function (settings) {
      //这里省略了一个callback函数
      console.log(settings);
      s = settings;
      // settings.categories = JSON.parse(settings.categories);
      // settings.sub_categories = JSON.parse(settings.sub_categories);
      that.globalData.settings = settings;
    }).then(() => {
      // 所以此处加入 callback 以防止这种情况
      if (this.settingsCallback) {
        this.settingsCallback(s);
      }
    }).catch(console.error);
  },
  /**
  用户登录：
      console.log(res.code);
      拿到res.code 到后台换openid
      发送 res.code 到后台换取 openId, sessionKey, unionId
      返回值data为0或1，返回值为0，用户没有注册过，返回值为1，用户已经注册过。
  */
  login(sharer) {
    let that = this;
    let u = {};
    wx.login({
      success: res => {
        let paramsJson = {
          code: res.code,
          sharer: sharer,
        };
        AV.Cloud.run('login', paramsJson).then(function (user) {
          u = user;
          that.globalData.userInfo = user;
          that.getUserInfo(user.objectid);
        }).then(() => {
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(u);
          }
        }).catch(console.error);
      }
    });
  },
  /**
   * 获取用户信息
   * 如果用户已经授权，则将用户的信息上传到redis，并存到全局变量中。
   * 如果用户没有授权，向全局变量标记用户没有授权。
   */
  getUserInfo: function (objectid) {
    let that = this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              const paramsJson = {
                userinfo: res.userInfo,
                objectid: objectid,
              };
              // this.globalData.userInfo = res.userInfo;
              AV.Cloud.run('getUserInfo', paramsJson).then(function (data) {
                userinfo = data;
                console.log(userinfo);
                that.globalData.userInfo = userinfo;
              }).catch(console.error);
            }
          });
        } else {

        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    console.log(options);
    console.log('app切换到前台');
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('app前台切换到后台');
  },
  globalData: {
    userInfo: null,
    settings: null,
    lottery_times:0,
  }
})