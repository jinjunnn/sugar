/**
 * 组队活动
 */



const AV = require('../../../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();
let key = null;
let teamid;

/**
 * 1.用户是否有id，没有id获得id
 * 2.用户是否授权了头像，没有授权头像去授权头像；
 * 3.查询用户今日是否有参加：
 * 3.1如果用户参加了，直接进入参加的list
 * 3.2如果用户没有参加，则创建一个list
 * 4.分享
 */

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_images:[],
    button_value:'share',//如果用户已经参加，或者用户组团，按钮应当是'share',如果用户没有参团，也不是组局，而是自己进来的，则是'attend'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    if (options.hasOwnProperty('key')) {
      key = options.key;
    } 
    that.setData({
      today: common.get_full_time(),
    });
    that.pre_onload();
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#f7d0a6',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
  },

  get_teams_content(){
    let that = this;
        let paramsJson = {
          key: 'settings', //key
          field: 'teams_gift_content',
        };
        Cloud.run('getField', paramsJson).then((result) => {
          console.log(result);
          that.setData({
            teams_content:result,
          })
        }).catch(error => {
          console.log(error);
        });
  },

  get_teams_gifts(){
      let that = this;
      let paramsJson = {
        key: 'settings', //key
        field: 'teams_gift_images',
      };
      Cloud.run('getField', paramsJson).then((result) => {
        that.setData({
          gifts: result,
        });
      }).catch(error => {
        console.log(error);
      });
  },

  get_teams_title() {
    let that = this;
    let paramsJson = {
      key: 'settings', //key
      field: 'teams_gift_title',
    };
    Cloud.run('getField', paramsJson).then((result) => {
      that.setData({
        teams_title: result,
      });
    }).catch(error => {
      console.log(error);
    });
  },

  pre_onload(){
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.navigateTo({
            url: '/pages/user/login/login'
          });
        } else {
          if (Boolean(app.globalData.userInfo)) {
            that.query_attend(app.globalData.userInfo.uid, app.globalData.userInfo.image);
          } else {
            app.userInfoReadyCallback = u => {
              console.log("拿到用户信息，查询用户参与抽奖的记录")
              that.query_attend(u.uid, u.image);
            }
          }
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    that.get_teams_gifts();
    that.get_teams_content();
    that.get_teams_title();
  },
  /**
   * 查询用户是否参加活动
   * 1。果用户已经参加了，进入到已经参加的list中。
   * 2.如果用户没有参加：
   * 2.1如果我是通过链接进来的，则进入到链接的list中。
   * 2.2如果我没有通过链接进来，则创建一个list。
   */
  query_attend(uid,u_image,share_key){
    console.log('进入query_attend流程')
    let that = this;
    teamid = 'team_' + common.get_full_time() + '_' + uid;
    console.log('teamid=',teamid)
    /**
     * 查询teamlist
     */
    let query_team = (id) => {
      let that = this;
      let paramsJson = {
        key: id,
      };
      console.log(paramsJson);
      Cloud.run('getSet', paramsJson).then((result) => {
        console.log(result);
        console.log(result.length);
        that.setData({
          user_images: result.map(item => item = JSON.parse(item)),
        });
      }).catch(error => {
        console.log(error);
      });
    };

    let query_attend = () =>{
        let paramsJson = {
          key: 'teams_' + common.get_full_time(), //key
          field: uid,
        };
        Cloud.run('getField', paramsJson).then((result) => {
            console.log(result);
            query_team(result);
        }).catch(error => {
          console.log(error);
        });
    };

    let paramsJson = {
      key: 'teams_' + common.get_full_time(), //key
      field: uid,
    };
    console.log(paramsJson);
    /**
     * 查询用户今天是否已经抽过奖
     * 1.如果抽过奖，则返回参与抽奖的页面，
     * 2.如果没有。查看是分享进来的还是主动进来的
     * 3.如果是分享进来的，则新建一个list
     * 4.如果是用户主动进来的，新建一个list
     */
    Cloud.run('hasField', paramsJson).then((result) => {
      console.log('查询今天用户是否抽奖的结果是：',result);
      if(result == 1){
        console.log('今天用户已经抽过奖');
        query_attend();
      }else if (result == 0){
        console.log('今天用户没有抽过奖');
        if (key!=null) {
          console.log('我是通过分享链接进来的');
          console.log(key);
          teamid = key;
          query_team(key); //是抽奖集合的key
          that.setData({
            button_value:'attend',
          });
        }else{
          //用户没有组过队，新建一个组队。
          console.log('进入抽奖页面');
          that.set_team_list(uid, teamid, u_image, common);
        }
      }

    }).catch(error => {
      console.log(error);
    });
  },

  /**
   * 组队的人数已满
   * 点击按钮，新建一个组队
   */
  bind_new_team(){
    let that = this;
    newteamid = 'team_' + common.get_full_time() + '_' + app.globalData.userInfo.uid;

    if (newteamid == teamid){
        wx.showToast({
          title: '每个用户每天只能参加一次组队',
          icon: 'none',
          duration: 2000
        })
    }else{
        that.set_team_list(app.globalData.userInfo.uid, newteamid, app.globalData.userInfo.image, common.get_full_time());
    }
    
  },

  /**
   * 点击进入组队记录页面
   */
  bind_nav_record() {
    console.log('123')
    wx.navigateTo({
      url: '/pages/user/record/team/team'
    });
  },
  /**
   * 用户点击抽奖
   * 未开发待续的功能，
   * 1.用户点击组队时，要查询，这名用户是否在队长的组过队伍的集合中，  teamsharee_uid
   * 2.如果在组过队伍的集合中，返回，您已经参加过该组队活动，是否新建组队。
   * 3.
   */
  tap_button() {

    /**
     * 查询组队集合
     */
    let query_team_owner = () => {
      let team_owner = teamid.slice(-8);
      console.log('我是team_owner',team_owner);
      let paramsJson = {
        key: team_owner, //key
        value: app.globalData.userInfo.uid,
      };
      console.log(paramsJson);
      Cloud.run('existSet', paramsJson).then((result) => {
        console.log('我是查询existSet的结果：',result);
        if (result == 1) {
          //情况2：用户已经参加过队长的组队，不能够再参加，需要重新创建一个组队
          wx.showModal({
            title: '您已参加过该队长的组队',
            content: '是否创建一个新的组队？',
            success(res) {
              if (res.confirm) {
                let d = new Date();
                let time = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2);
                teamid = 'team_' + time + '_' + app.globalData.userInfo.uid
                that.set_team_list(app.globalData.userInfo.uid, teamid, app.globalData.userInfo.image, time);
              } else if (res.cancel) {
                console.log('用户点击取消');
              }
            }
          });
        }else{
          //情况3：用户没有参加过队长的组队，直接组队
                let d = new Date();
                let time = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2);
                console.log(teamid);
                that.set_team_list(app.globalData.userInfo.uid, teamid, app.globalData.userInfo.image, time);
        }
      }).catch(error => {
        console.log(error);
      });
    };


    console.log('用户点击组队');
    let that = this;
    let d = new Date();
    let time = String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2);
    console.log('查询当前组队的人数:' ,that.data.user_images.length);
    if (that.data.user_images.length <5 ){
      console.log('组队人数少于5人');
      //情况1：查询队伍的人数数量，小于5可以组队，等于5，需要重新组队。
      query_team_owner();
    } else{
        wx.showModal({
          title: '队伍成员已满',
          content: '创建一个组队',
          success(res) {
            if (res.confirm) {
                    teamid = 'team_' + time + '_' + app.globalData.userInfo.uid;
                    that.set_team_list(app.globalData.userInfo.uid, teamid, u_image, time);
            } else if (res.cancel) {
              console.log('用户点击取消');
            }
          }
        });
    }

  },


  /**
   * 这里进行了三个操作，
   * 1.在今日抽奖哈希表中，将自己的uid作为key,抽奖teamid,作为value
   * 2.在teamid中，增加一条记录，记录的内容是，抽奖用户的头像；
   * 3.在我的抽奖集合中，增加teamid，方便查询历史抽奖记录。
   * 4.将uid信息，放到队长的teamsharee_uid，集合中。
   */
  set_team_list(uid,teamid,u_image,today){
    console.log(uid, teamid, u_image, today);
       /*
       * 向team赋值，team是一个集合
       */
      let new_team = (teamid, u_image) => {
        let d = new Date();
        let time =  String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2);
        let value = {
          image: u_image,
          objectid : app.globalData.userInfo.objectid,
          time: time,
          uid:app.globalData.userInfo.uid,
        }
        let paramsJson = {
          key: teamid, //key
          value: JSON.stringify(value),
        };
        Cloud.run('setSet', paramsJson).then((result) => {
          console.log(result); //1:创建成功
          query_team(teamid);
          query_team_result();
        }).catch(error => {
          console.log(error);
        });
      };

    /**
     * 查询组队的结果，如果组队的人数满5人
     * 给每一个人派发48心愿
     * 并且增加一条发放心愿的记录
     */
    let query_team_result = () => {
        let paramsJson = {
          key: teamid, 
        };
        console.log('我是查询组队结果功能的参数：',paramsJson);
        Cloud.run('query_team_result', paramsJson).then((result) => {
          console.log('我是查询组队结果的结果：',result);
        }).catch(error => {
          console.log(error);
        });
    }
    /**
     * 查询teamlist
     */
    let query_team = (teamid) => {
        let that = this;
        let paramsJson = {
          key: teamid,
        };
        console.log(teamid);
        Cloud.run('getSet', paramsJson).then((result) => {
          that.setData({
            user_images: result.map(item => item = JSON.parse(item)),
          })
        }).catch(error => {
          console.log(error);
        });

    };
    /**
     * 今天的抽奖信息，加入到redis teams_{{today}}中，因为每个用户每天只能参加一个抽奖
     * 这个要给几个设置一个有效期，24小时后过期
     */
    
    let set_teams = (uid,teamid) => {
      let paramsJson = {
        key: 'teams_' + common.get_full_time(), //key
        field: uid,
        value: teamid,
      };
      Cloud.run('setField', paramsJson).then((result) => {
        console.log(result); //1:创建成功
      }).catch(error => {
        console.log(error);
      });
    };
    /**
     * 今天的抽奖信息，加入到redis teams_{{today}}中，因为每个用户每天只能参加一个抽奖
     * 这个要给几个设置一个有效期，24小时后过期
     */
    let set_my_team_list = (uid,teamid) => {
      let paramsJson = {
        key: 'teamlist_' + uid, //key
        value: teamid,
      };
      Cloud.run('setSet', paramsJson).then((result) => {
        console.log(result); //1:创建成功
      }).catch(error => {
        console.log(error);
      });
    };
    /**
     * 将用户的信息，放到组队集合中
     */
    let set_team_owner_set = () => {
      let team_owner = teamid.slice(-8);
      let paramsJson = {
        key: 'teamsharee_' + team_owner, //key
        value: app.globalData.userInfo.uid,
      };
      if (team_owner != app.globalData.userInfo.uid){
          Cloud.run('setSet', paramsJson).then((result) => {
            console.log(result); //1:创建成功
          }).catch(error => {
            console.log(error);
          });
      }
    };
    set_my_team_list(uid,teamid);
    set_teams(uid, teamid);
    new_team(teamid, u_image);
    set_team_owner_set();
    let that = this;
    that.setData({
      button_value:'share'
    })
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
    console.log(app.globalData.userInfo.uid);
    let that = this;
    let path = '/pages/act/team/team?key=' + teamid + '&sharer=' + app.globalData.userInfo.uid; //imageUrl: app.globalData.confi.userSharePage.imageUrl,
    return {
      title: that.data.teams_title,
      path: path,
      imageUrl: that.data.gifts
    }
  }
})