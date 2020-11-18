const {User} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const AV = require('../../../utils/av-live-query-weapp-min');
var app = getApp();

Page({
  data: {

  },
  onLoad: function () {

  },

  input_value(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      value: e.detail.value
    });
  },

  onGotUserInfo(e) {
    wx.showLoading({title: '加载中',});
    let that = this;
    let login = (openid) => {
        const paramsJson = {
          userinfo: e.detail.userInfo,
          objectid: openid,
        };
        return AV.Cloud.run('getUserInfo', paramsJson).then((x) => {
          that.setData({
            userInfo: x,
          });
          app.globalData.userInfo = x;
        }).then(() => {
          //  在这里关掉loading 条
          wx.hideLoading();
          wx.navigateBack({
            delta: 1
          });
        });
    };

    if (Boolean(app.globalData.userInfo)) {
      //app.login()已经返回用户id
      console.log('拿到用户的uid');
      login(app.globalData.userInfo.objectid);
    } else {
      //app.login()没有返回用户id
      app.userInfoReadyCallback = u => {
        //callback返回正确的uid
        console.log('没有拿到用户的信息，等待app.js返回数据');
        login(u.objectid);
      };
    }
  },
});