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
        } else {
          wx.hideTabBar()
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
    }, error => {
      if (error.code === '2003') {
        wx.showToast({
          title: '查询不到事件',
          icon: 'none',
          duration: 2000
        })
      }
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
  },
  eventDetail(e) {
    service.checkUserInfo().then(data => {
      if (data.role.length !== 0 && data.role.includes('Publisher')) {
        wx.navigateTo({
          url: 'publisher_event/publisher_event?code=' + e.currentTarget.dataset.code +
            '&name=' + e.currentTarget.dataset.name
        })
      } else if (data.role.length !== 0 && data.role.includes('Observer')) {
        wx.navigateTo({
          url: 'observer_event/observer_event?code=' + e.currentTarget.dataset.code +
            '&name=' + e.currentTarget.dataset.name
        })
      } else {
        wx.navigateTo({
          url: 'participant_event/participant_event?code=' + e.currentTarget.dataset.code
        })
      }
    })
  }
})