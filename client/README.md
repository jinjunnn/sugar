# 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

往redis settings中设置数组
let categories =  ['热门', '美妆', '包袋', '服饰', '女鞋', '男士', '潮牌'];
const paramsJson = {
    key: 'settings',
    field: 'categories',
    value: categories, //这个是什么忘记了
};
AV.Cloud.run('setField', paramsJson).then(function (data) {
    console.log(data);
}).catch(console.error);



      // {
      //   "pagePath": "pages/giftcard/giftcard",
      //   "iconPath": "image/home_page_2.png",
      //   "selectedIconPath": "image/home_page.png",
      //   "text": "会员"
      // },




    //兰蔻香水  100中奖盲盒
    let act = {
      type: 'box', //这个是类型
      currency: 'wish', //wish:心愿  cash：现金
      price: '980', //价格
      banner: 'http://lc-XBtceMXX.cn-n1.lcfile.com/9664301882bff248d87b/WechatIMG2205.jpeg', //详情页面的主图
      icon: 'http://lc-XBtceMXX.cn-n1.lcfile.com/e08a710e8f3fc249e647/%E7%9F%A9%E5%BD%A2.png', //选盒页面的icon图
      title: 'LANCOME香水盲盒',
      content: '980心愿盲盒！100%抽中一款香水！从此再不用买香水！',
      detail: 'http://lc-XBtceMXX.cn-n1.lcfile.com/d28a87f0f223fa23e6ab/WechatIMG2204.jpeg', //选盒页面的详情图
      id: '1003',
      key: 'act_1003',
      link: '/pages/act/box/box?key=act_1003',
      image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/9664301882bff248d87b/WechatIMG2205.jpeg', //这个是列表页面的banner图
      buttons: '立刻参与',
      share_card: 'http://lc-XBtceMXX.cn-n1.lcfile.com/9664301882bff248d87b/WechatIMG2205.jpeg', //分享卡片图，以及购买页面的主图
      a: '真爱奇迹香水5ML',
      b: '真爱奇迹香水5ML',
      c: '真爱奇迹香水5ML',
      d: '美丽人生女士香水4ML',
      e: '美丽人生女士香水4ML',
      f: '美丽人生女士香水4ML',
      g: '璀璨真爱女士香水7.5ML',
      h: '璀璨真爱女士香水7.5ML',
      i: '清新花香调女士香水5ML',
      j: '清新花香调女士香水5ML',
      k: '璀璨爱恋女士香水5ML',
      l: '璀璨爱恋女士香水5ML',
      m: '反转巴黎女士香水5ML',
      a_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/d0ef78903008d01c9d1f/WechatIMG2199.jpeg',
      b_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/d0ef78903008d01c9d1f/WechatIMG2199.jpeg',

      c_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/d0ef78903008d01c9d1f/WechatIMG2199.jpeg',
      d_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/4f529ac14e151e7eca4c/WechatIMG2200.jpeg',

      e_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/4f529ac14e151e7eca4c/WechatIMG2200.jpeg',
      f_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/4f529ac14e151e7eca4c/WechatIMG2200.jpeg',

      g_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/c56682328b58e9927238/WechatIMG2201.jpeg',
      h_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/c56682328b58e9927238/WechatIMG2201.jpeg',

      i_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/229d26298149c9c0cf76/WechatIMG2202.jpeg',
      j_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/229d26298149c9c0cf76/WechatIMG2202.jpeg',

      k_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/afc2fcaa321a24532051/WechatIMG2203.jpeg',
      l_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/afc2fcaa321a24532051/WechatIMG2203.jpeg',

      m_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/f1a5d783d106f7dbce6a/WechatIMG2167.jpeg',
    };


    //1004  兰蔻 1/12
    let act = {
      type: 'box', //这个是类型
      currency: 'wish', //wish:心愿  cash：现金
      price: '98', //价格
      banner: 'http://lc-XBtceMXX.cn-n1.lcfile.com/9664301882bff248d87b/WechatIMG2205.jpeg', //详情页面的主图
      icon: 'http://lc-XBtceMXX.cn-n1.lcfile.com/e08a710e8f3fc249e647/%E7%9F%A9%E5%BD%A2.png', //选盒页面的icon图
      title: 'LANCOME香水盲盒',
      content: '98心愿盲盒！12个盲盒中有一个盲盒包含商品！',
      detail: 'http://lc-XBtceMXX.cn-n1.lcfile.com/d28a87f0f223fa23e6ab/WechatIMG2204.jpeg', //选盒页面的详情图
      id: '1004',
      key: 'act_1004',
      link: '/pages/act/box/box?key=act_1004',
      image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/9664301882bff248d87b/WechatIMG2205.jpeg', //这个是列表页面的banner图
      buttons: '立刻参与',
      share_card: 'http://lc-XBtceMXX.cn-n1.lcfile.com/9664301882bff248d87b/WechatIMG2205.jpeg', //分享卡片图，以及购买页面的主图
      a: '添加好友领取购物奖励金',
      b: '添加好友领取购物奖励金',
      c: '添加好友领取购物奖励金',
      d: '添加好友领取购物奖励金',
      e: '美丽人生女士香水4ML',
      f: '添加好友领取购物奖励金',
      g: '添加好友领取购物奖励金',
      h: '添加好友领取购物奖励金',
      i: '添加好友领取购物奖励金',
      j: '添加好友领取购物奖励金',
      k: '添加好友领取购物奖励金',
      l: '添加好友领取购物奖励金',
      m: '反转巴黎女士香水5ML',
      a_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
      b_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      c_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
      d_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      e_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/4f529ac14e151e7eca4c/WechatIMG2200.jpeg',
      f_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      g_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
      h_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      i_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
      j_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      k_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
      l_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      m_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/f1a5d783d106f7dbce6a/WechatIMG2167.jpeg',
    };




        //dior 香水  100盲盒
        let act = {
      type: 'box', //这个是类型
      currency: 'wish', //wish:心愿  cash：现金
      price: '580', //价格
      banner: 'http://lc-XBtceMXX.cn-n1.lcfile.com/64db7acedd566edd947a/WechatIMG2212.jpeg', //详情页面的主图
      icon: 'http://lc-XBtceMXX.cn-n1.lcfile.com/e08a710e8f3fc249e647/%E7%9F%A9%E5%BD%A2.png', //选盒页面的icon图
      title: 'DIOR香水盲盒',
      content: '580心愿盲盒！每个盲盒都有一款香水！让您再也不用买香水！',
      detail: '', //选盒页面的详情图
      id: '1005',
      key: 'act_1005',
      link: '/pages/act/box/box?key=act_1003',
      image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/64db7acedd566edd947a/WechatIMG2212.jpeg', //这个是列表页面的banner图
      buttons: '立刻参与',
      share_card: 'http://lc-XBtceMXX.cn-n1.lcfile.com/64db7acedd566edd947a/WechatIMG2212.jpeg', //分享卡片图，以及购买页面的主图
      a: '迪奥甜心香水5ML',
      b: '迪奥甜心香水5ML',
      c: '迪奥甜心香水5ML',
      d: '迪奥真我淡香水5ML',
      e: '迪奥真我淡香水5ML',
      f: '迪奥真我淡香水5ML',
      g: '迪奥真我浓香水5ML',
      h: '迪奥真我浓香水5ML',
      i: '迪奥魅惑香水5ML',
      j: '迪奥魅惑香水5ML',
      k: '迪奥花漾香水5ML',
      l: '迪奥花漾香水5ML',
      m: '反转巴黎女士香水5ML',
      a_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/938ae05e0b0a25661442/%E7%94%9C%E5%BF%83.jpeg',
      b_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/938ae05e0b0a25661442/%E7%94%9C%E5%BF%83.jpeg',

      c_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/938ae05e0b0a25661442/%E7%94%9C%E5%BF%83.jpeg',
      d_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/8589effc15ca77950a06/%E7%9C%9F%E6%88%91%E6%B7%A1%E9%A6%99.jpeg',

      e_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/8589effc15ca77950a06/%E7%9C%9F%E6%88%91%E6%B7%A1%E9%A6%99.jpeg',
      f_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/8589effc15ca77950a06/%E7%9C%9F%E6%88%91%E6%B7%A1%E9%A6%99.jpeg',

      g_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/02cd3061a062fa43b8ae/%E7%9C%9F%E6%88%91%E6%B5%93%E9%A6%99.jpeg',
      h_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/02cd3061a062fa43b8ae/%E7%9C%9F%E6%88%91%E6%B5%93%E9%A6%99.jpeg',

      i_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/a310da21d559d4e04bc8/%E9%AD%85%E6%83%91.jpeg',
      j_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/a310da21d559d4e04bc8/%E9%AD%85%E6%83%91.jpeg',

      k_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/ff4dd4732fee08fc9bb6/%E8%8A%B1%E6%BC%BE.jpeg',
      l_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/ff4dd4732fee08fc9bb6/%E8%8A%B1%E6%BC%BE.jpeg',

      m_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/f1a5d783d106f7dbce6a/WechatIMG2167.jpeg',
    };


    //迪奥  1/12 香水
        let act = {
      type: 'box', //这个是类型
      currency: 'wish', //wish:心愿  cash：现金
      price: '98', //价格
      banner: 'http://lc-XBtceMXX.cn-n1.lcfile.com/64db7acedd566edd947a/WechatIMG2212.jpeg', //详情页面的主图
      icon: 'http://lc-XBtceMXX.cn-n1.lcfile.com/e08a710e8f3fc249e647/%E7%9F%A9%E5%BD%A2.png', //选盒页面的icon图
      title: '迪奥香水盲盒',
      content: '98心愿盲盒！12个盲盒中有一个盲盒包含商品！',
      detail: 'http://lc-XBtceMXX.cn-n1.lcfile.com/d28a87f0f223fa23e6ab/WechatIMG2204.jpeg', //选盒页面的详情图
      id: '1006',
      key: 'act_1006',
      link: '/pages/act/box/box?key=act_1006',
      image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/64db7acedd566edd947a/WechatIMG2212.jpeg', //这个是列表页面的banner图
      buttons: '立刻参与',
      share_card: 'http://lc-XBtceMXX.cn-n1.lcfile.com/64db7acedd566edd947a/WechatIMG2212.jpeg', //分享卡片图，以及购买页面的主图
      a: '添加好友领取购物奖励金',
      b: '添加好友领取购物奖励金',
      c: '添加好友领取购物奖励金',
      d: '添加好友领取购物奖励金',
      e: '添加好友领取购物奖励金',
      f: '添加好友领取购物奖励金',
      g: '添加好友领取购物奖励金',
      h: '添加好友领取购物奖励金',
      i: '迪奥魅惑香水5ML',
      j: '添加好友领取购物奖励金',
      k: '添加好友领取购物奖励金',
      l: '添加好友领取购物奖励金',
      m: '反转巴黎女士香水5ML',
      a_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
      b_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      c_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
      d_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      e_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
      f_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      g_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
      h_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      i_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/a310da21d559d4e04bc8/%E9%AD%85%E6%83%91.jpeg',
      j_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      k_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
      l_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

      m_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/f1a5d783d106f7dbce6a/WechatIMG2167.jpeg',
    };

    //肌美精3d 1/12 香水
    let act = {
        type: 'box', //这个是类型
        currency: 'wish', //wish:心愿  cash：现金
        price: '48', //价格
        banner: 'http://lc-XBtceMXX.cn-n1.lcfile.com/d9e600a39a793e1b3f08/WechatIMG2216.jpeg', //详情页面的主图
        icon: 'http://lc-XBtceMXX.cn-n1.lcfile.com/e08a710e8f3fc249e647/%E7%9F%A9%E5%BD%A2.png', //选盒页面的icon图
        title: '肌美精3D面膜盲盒',
        content: '48超值心愿盲盒！',
        detail: 'http://lc-XBtceMXX.cn-n1.lcfile.com/d28a87f0f223fa23e6ab/WechatIMG2204.jpeg', //选盒页面的详情图
        id: '1007',
        key: 'act_1007',
        link: '/pages/act/box/box?key=act_1007',
        image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/d9e600a39a793e1b3f08/WechatIMG2216.jpeg', //这个是列表页面的banner图
        buttons: '立刻参与',
        share_card: 'http://lc-XBtceMXX.cn-n1.lcfile.com/d9e600a39a793e1b3f08/WechatIMG2216.jpeg', //分享卡片图，以及购买页面的主图
        a: '添加好友领取购物奖励金',
        b: '添加好友领取购物奖励金',
        c: '添加好友领取购物奖励金',
        d: '添加好友领取购物奖励金',
        e: '添加好友领取购物奖励金',
        f: '添加好友领取购物奖励金',
        g: '添加好友领取购物奖励金',
        h: '添加好友领取购物奖励金',
        i: '肌美精3D面膜三选一',
        j: '添加好友领取购物奖励金',
        k: '添加好友领取购物奖励金',
        l: '添加好友领取购物奖励金',
        m: '反转巴黎女士香水5ML',
        a_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
        b_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

        c_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
        d_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

        e_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
        f_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

        g_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
        h_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

        i_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/dcb159e0ea1d8b59defd/WechatIMG2216.jpeg',
        j_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

        k_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
        l_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

        m_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/f1a5d783d106f7dbce6a/WechatIMG2167.jpeg',
    };


    //凡尔赛面膜100中奖

    let act = {
      type: 'box', //这个是类型
      currency: 'wish', //wish:心愿  cash：现金
      price: '980', //价格
      banner: 'http://lc-XBtceMXX.cn-n1.lcfile.com/3b5960e0659dc6967c70/WechatIMG2221.jpeg', //详情页面的主图
      icon: 'http://lc-XBtceMXX.cn-n1.lcfile.com/e08a710e8f3fc249e647/%E7%9F%A9%E5%BD%A2.png', //选盒页面的icon图
      title: '凡尔赛面膜盲盒',
      content: '980心愿盲盒！每个盲盒都有一款凡尔赛面膜100%中奖！',
      detail: '', //选盒页面的详情图
      id: '1008',
      key: 'act_1008',
      link: '/pages/act/box/box?key=act_1008',
      image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/3b5960e0659dc6967c70/WechatIMG2221.jpeg', //这个是列表页面的banner图
      buttons: '立刻参与',
      share_card: 'http://lc-XBtceMXX.cn-n1.lcfile.com/3b5960e0659dc6967c70/WechatIMG2221.jpeg', //分享卡片图，以及购买页面的主图
      a: '凡尔赛深层补水面膜1片',
      b: '凡尔赛深层补水面膜1片',
      c: '凡尔赛深层补水面膜1片',
      d: '凡尔赛弹力紧致面膜1片',
      e: '凡尔赛弹力紧致面膜1片',
      f: '凡尔赛弹力紧致面膜1片',
      g: '凡尔赛淡斑提亮面膜1片',
      h: '凡尔赛淡斑提亮面膜1片',
      i: '凡尔赛淡斑提亮面膜1片',
      j: '凡尔赛保湿美白面膜1片',
      k: '凡尔赛保湿美白面膜1片',
      l: '凡尔赛保湿美白面膜1片',
      m: '',
      a_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/fb7729cebe91b44f2d4f/%E6%B7%B1%E5%B1%82%E8%A1%A5%E6%B0%B4.jpeg',
      b_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/fb7729cebe91b44f2d4f/%E6%B7%B1%E5%B1%82%E8%A1%A5%E6%B0%B4.jpeg',

      c_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/fb7729cebe91b44f2d4f/%E6%B7%B1%E5%B1%82%E8%A1%A5%E6%B0%B4.jpeg',
      d_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/944aee6558e768ab1ce9/%E5%BC%B9%E5%8A%9B%E7%B4%A7%E8%87%B4.jpeg',

      e_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/944aee6558e768ab1ce9/%E5%BC%B9%E5%8A%9B%E7%B4%A7%E8%87%B4.jpeg',
      f_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/944aee6558e768ab1ce9/%E5%BC%B9%E5%8A%9B%E7%B4%A7%E8%87%B4.jpeg',

      g_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/232d8231b7728cda9b15/%E6%B7%A1%E6%96%91%E6%8F%90%E4%BA%AE.jpeg',
      h_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/232d8231b7728cda9b15/%E6%B7%A1%E6%96%91%E6%8F%90%E4%BA%AE.jpeg',

      i_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/232d8231b7728cda9b15/%E6%B7%A1%E6%96%91%E6%8F%90%E4%BA%AE.jpeg',
      j_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/80473c89039eeb31d850/%E4%BF%9D%E6%B9%BF%E7%BE%8E%E7%99%BD.jpeg',

      k_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/80473c89039eeb31d850/%E4%BF%9D%E6%B9%BF%E7%BE%8E%E7%99%BD.jpeg',
      l_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/80473c89039eeb31d850/%E4%BF%9D%E6%B9%BF%E7%BE%8E%E7%99%BD.jpeg',

      m_image: '',
    };

        let act = {
          type: 'box', //这个是类型
          currency: 'wish', //wish:心愿  cash：现金
          price: '298', //价格
          banner: 'http://lc-XBtceMXX.cn-n1.lcfile.com/22daa9d12bb0aeac63f3/WechatIMG2227.jpeg', //详情页面的主图
          icon: 'http://lc-XBtceMXX.cn-n1.lcfile.com/e08a710e8f3fc249e647/%E7%9F%A9%E5%BD%A2.png', //选盒页面的icon图
          title: 'PDC酒粕面膜盲盒',
          content: 'PDC酒粕面膜盲盒，每个整盒内含3件酒粕面膜，9个空盒',
          detail: '', //选盒页面的详情图
          id: '1009',
          key: 'act_1009',
          link: '/pages/act/box/box?key=act_1009',
          image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/22daa9d12bb0aeac63f3/WechatIMG2227.jpeg', //这个是列表页面的banner图
          buttons: '立刻参与',
          share_card: 'http://lc-XBtceMXX.cn-n1.lcfile.com/22daa9d12bb0aeac63f3/WechatIMG2227.jpeg', //分享卡片图，以及购买页面的主图
          a: '添加好友领取购物奖励金',
          b: '添加好友领取购物奖励金',
          c: '添加好友领取购物奖励金',
          d: 'PDC酒粕面膜',
          e: '添加好友领取购物奖励金',
          f: '添加好友领取购物奖励金',
          g: '添加好友领取购物奖励金',
          h: '添加好友领取购物奖励金',
          i: '添加好友领取购物奖励金',
          j: '添加好友领取购物奖励金',
          k: '添加好友领取购物奖励金',
          l: '添加好友领取购物奖励金',
          m: '添加好友领取购物奖励金',
          a_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
          b_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

          c_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
          d_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/22daa9d12bb0aeac63f3/WechatIMG2227.jpeg',

          e_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
          f_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

          g_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
          h_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

          i_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
          j_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

          k_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
          l_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',

          m_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/04776c520665112d1095/WechatIMG19.jpeg',
        };

        let act = {
          type: 'box', //这个是类型
          currency: 'wish', //wish:心愿  cash：现金
          price: '880', //价格
          banner: 'http://lc-XBtceMXX.cn-n1.lcfile.com/a518504b4dc0ddb6ba6d/WechatIMG2231.jpeg', //详情页面的主图
          icon: 'http://lc-XBtceMXX.cn-n1.lcfile.com/e08a710e8f3fc249e647/%E7%9F%A9%E5%BD%A2.png', //选盒页面的icon图
          title: '香奈儿香水小样盲盒',
          content: '香奈儿香水小样盲盒，每盒包含一款香奈儿香水小样',
          detail: '', //选盒页面的详情图
          id: '1010',
          key: 'act_1010',
          link: '/pages/act/box/box?key=act_1010',
          image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/a518504b4dc0ddb6ba6d/WechatIMG2231.jpeg', //这个是列表页面的banner图
          buttons: '立刻参与',
          share_card: 'http://lc-XBtceMXX.cn-n1.lcfile.com/a518504b4dc0ddb6ba6d/WechatIMG2231.jpeg', //分享卡片图，以及购买页面的主图
          a: '香奈儿邂逅橙7.5ML',
          b: '香奈儿邂逅橙7.5ML',
          c: '香奈儿邂逅绿7.5ML',
          d: '香奈儿邂逅绿7.5ML',
          e: '香奈儿邂逅粉7.5ML',
          f: '香奈儿邂逅粉7.5ML',
          g: '香奈儿可可小姐5ML',
          h: '香奈儿可可小姐5ML',
          i: '香奈儿可可小姐5ML',
          j: '香奈儿可可小姐5ML',
          k: '香奈儿5号香水5ML',
          l: '香奈儿5号香水5ML',
          m: '香奈儿5号香水5ML',
          a_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/f8d5d6d8a8f6833511d9/%E7%B2%89.jpeg',
          b_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/f8d5d6d8a8f6833511d9/%E7%B2%89.jpeg',

          c_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/6739d346525a56a5a3bf/%E7%BB%BF.jpeg',
          d_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/6739d346525a56a5a3bf/%E7%BB%BF.jpeg',

          e_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/3b0c4ba567abbad7b0db/%E6%A9%99.jpeg',
          f_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/3b0c4ba567abbad7b0db/%E6%A9%99.jpeg',

          g_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/5cf1dd9fb1c7cdb3aaa1/%E5%8F%AF%E5%8F%AF%E5%B0%8F%E5%A7%90.jpeg',
          h_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/5cf1dd9fb1c7cdb3aaa1/%E5%8F%AF%E5%8F%AF%E5%B0%8F%E5%A7%90.jpeg',

          i_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/5cf1dd9fb1c7cdb3aaa1/%E5%8F%AF%E5%8F%AF%E5%B0%8F%E5%A7%90.jpeg',
          j_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/53dfcc4e50aee50d14df/5%E5%8F%B7.jpeg',

          k_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/53dfcc4e50aee50d14df/5%E5%8F%B7.jpeg',
          l_image: 'http://lc-XBtceMXX.cn-n1.lcfile.com/53dfcc4e50aee50d14df/5%E5%8F%B7.jpeg',

          m_image: '',
        };














        // let act = {
    //   type: 'box', //这个是类型
    //   currency: 'wish', //wish:心愿  cash：现金
    //   price: '98', //价格
    //   banner: '', //详情页面的主图
    //   icon: 'http://lc-XBtceMXX.cn-n1.lcfile.com/e08a710e8f3fc249e647/%E7%9F%A9%E5%BD%A2.png', //选盒页面的icon图
    //   title: '',
    //   content: '',
    //   detail: '', //选盒页面的详情图
    //   id: '1004',
    //   key: 'act_1004',
    //   link: '/pages/act/box/box?key=act_1004',
    //   image: '', //这个是列表页面的banner图
    //   buttons: '立刻参与',
    //   share_card: '', //分享卡片图，以及购买页面的主图
    //   a: '',
    //   b: '',
    //   c: '',
    //   d: '',
    //   e: '',
    //   f: '',
    //   g: '',
    //   h: '',
    //   i: '',
    //   j: '',
    //   k: '',
    //   l: '',
    //   m: '',
    //   a_image: '',
    //   b_image: '',

    //   c_image: '',
    //   d_image: '',

    //   e_image: '',
    //   f_image: '',

    //   g_image: '',
    //   h_image: '',

    //   i_image: '',
    //   j_image: '',

    //   k_image: '',
    //   l_image: '',

    //   m_image: '',
    // };