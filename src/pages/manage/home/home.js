const APP = getApp();
const service = require('../service.js');
Page({
  data: {
    actionList: [],
    name: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    authButtonShow: true,
    checkingUser: false,
  },
  onLoad() {
    this.checkoutUser().then(() => {})
  },
  checkoutUser() {
    wx.showLoading({
      mask: true,
      title: "加载中..."
    });
    return new Promise((reslove, reject) => {
      const userInfo = {}
      const _this = this;
      service.checkUserInfo().then(data => {
        APP.globalData.userInfo = data;
        wx.hideLoading();

        let list = _this.data.actionList;
        if (data.power.includes('event_admin')) {
          list.push({
            name: "任务管理",
            desc: '编辑发布任务',
            url: 'taskManage'
          });
        }
        if (data.power.includes('account_admin')) {
          list.push({
            name: "人员管理",
            desc: "修改管理人员",
            url: 'personManage'
          }, {
            name: "角色管理",
            desc: "可通过角色管理人员",
            url: 'roleManage'
          });
        }
        this.setData({
          checkingUser: true,
          name: data.name,
          actionList: list
        });
        reslove();
      }).catch(e => {
        wx.hideLoading();
        wx.redirectTo({
          url: '../../login/login',
        })
      });
    })
  },
  bindGetUserInfo(e) {
    this.setData({
      authButtonShow: false
    })
  }
})