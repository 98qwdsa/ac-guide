// pages/login/login.js
const service = require('../business.js');
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginBoxShow: false,
    data: {
      name: '',
      //phone: ''
    }
  },
  onGotUserInfo(e) {
    if (e.detail.errMsg === 'getUserInfo:ok') {
      this.register();
    }
  },
  // 注册
  register(e) {
    console.log(this.data.data);
    wx.showLoading({
      mask: true,
      title: "登录中..."
    });
    service.register(
      this.data.data
    ).then(res => {
      console.log(res);
      APP.globalData.userInfo = res;
      wx.hideLoading();
      wx.redirectTo({
        url: '../event_flow/list/list',
      })
    }).catch(e => {
      wx.hideLoading();
    });
  },
  nameInput(e) {
    this.setData({
      ['data.name']: e.detail.value
    })
  },
  phoneInput(e) {
    // this.setData({
    //   ['data.phone']: e.detail.value
    // })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      mask: true,
      title: "登录中..."
    });
    const userInfo = {}
    service.checkUserInfo().then(data => {
      console.log(data);
      APP.globalData.userInfo = data;
      wx.hideLoading();
      wx.redirectTo({
        url: '../event_flow/list/list',
      })
    }).catch(e => {
      wx.hideLoading();
      if (e.code === '2000') {
        this.setData({
          loginBoxShow: true
        })
      }
    });

    // console.log(userinfo)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})