//app.js
App({
  onLaunch: function() {
    wx.hideTabBar();
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
    wx.cloud.init({
      env: 'demo-5c0mj'
    });
    this.DB = wx.cloud.database({
      env: 'demo-5c0mj'
    });
  },
  globalData: {
    userInfo: null,
    roles:'', // 可参与角色页面的角色数组
    stepIndex: 0, //新增、修改任务步骤的下标
    stepName: '' //新增、修改任务步骤的名字
  }
})