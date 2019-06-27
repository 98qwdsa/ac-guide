const APP = getApp();
const service = require('../business.js');
Page({
  data: {
    eventList: [],
    name: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    authButtonShow: true
  },
  onLoad() {
    this.loadData();
    this.setData({
      name: APP.globalData.userInfo.name,
      canEditEvent: APP.globalData.userInfo.power.indexOf('admin') > -1
    })
  },
  loadData() {
    wx.showLoading({
      mask: true
    })
    service.getEventList().then(eventList => {
      this.setData({
        eventList
      })
      wx.hideLoading();
    });

    // 查看是否授权
    const _this = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success(res) {
              _this.setData({
                authButtonShow: false
              })
            }
          })
        } else {
          _this.setData({
            authButtonShow: true
          });
        }
      }
    })
  },
  bindGetUserInfo(e) {
    this.setData({
      authButtonShow: false
    })
  }
})