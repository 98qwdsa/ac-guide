const APP = getApp();
const service = require('../../business.js');
Page({
  data: {
    eventList: [],
    name: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    authButtonShow: true,
    checkingUser: false
  },
  onLoad() {
    this.checkoutUser().then(() => {
      this.loadData();
    })
  },
  checkoutUser() {
    wx.showLoading({
      mask: true,
      title: "加载中..."
    });
    return new Promise((reslove, reject) => {
      const userInfo = {}
      service.checkUserInfo().then(data => {
        console.log(data);
        APP.globalData.userInfo = data;
        wx.hideLoading();
        this.setData({
          checkingUser: true,
          name: data.name
        });
        wx.setNavigationBarTitle({
          title: '首页',
        })
        if (data.power.includes('event_admin') || data.power.includes('account_admin')) {
          wx.showTabBar();
        }
        reslove();
      }).catch(e => {
        wx.hideLoading();
        wx.redirectTo({
          url: '../../login/login',
        })
      });
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