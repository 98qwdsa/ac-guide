const APP = getApp();
const service = require('../service.js');
Page({
  data: {
    eventList: [],
    name: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    authButtonShow: true,
    checkingUser: false
  },
  onLoad() {
    wx.hideTabBar()
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
          wx.setTabBarItem({
            "index": 0,
            "text": "首页",
            "iconPath": "asset/hr_guide2.png",
            "selectedIconPath": "asset/hr_guide.png"
          })
          wx.setTabBarItem({
            "index": 1,
            "text": "管理",
            "iconPath": "asset/hr_guide4.png",
            "selectedIconPath": "asset/hr_guide3.png"
          })
          wx.showTabBar()
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
    return new Promise((reslove, reject) => {
      service.getEventList().then(eventList => {
        this.setData({
          eventList
        })
        wx.hideLoading();
        reslove()
      }, error => {
        if (error.code === '2003' || error.code === '2002') {
          wx.showToast({
            title: '无任务',
            icon: 'none',
            duration: 2000
          })
        }
        this.setData({
          eventList: []
        });
      });
    })
  },
  bindGetUserInfo(e) {
    this.setData({
      authButtonShow: false
    })
  },
  eventDetail(e) {
    const userInfo = APP.globalData.userInfo;
    if (userInfo.role.length !== 0 && userInfo.role.includes('Publisher')) {
      wx.navigateTo({
        url: 'publisher_event/publisher_event?code=' + e.currentTarget.dataset.code +
          '&name=' + e.currentTarget.dataset.name
      })
    } else if (userInfo.role.length !== 0 && userInfo.role.includes('Observer')) {
      wx.navigateTo({
        url: 'observer_event/observer_event?code=' + e.currentTarget.dataset.code +
          '&name=' + e.currentTarget.dataset.name
      })
    } else {
      wx.navigateTo({
        url: 'participant_event/participant_event?code=' + e.currentTarget.dataset.code
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh()
    this.loadData()
  }
})