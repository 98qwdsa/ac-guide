// src/pages/manage/personManage/editUser/editUser.js
let userInfo = getApp().globalData.managerHomePersonManageEditUser;
const service = require('../../../service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    userName: '',
    power: [],
    role: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.displayData(options.userId);
  },
  displayData(userId) {
    Promise.all([this.loadRole(), this.loadUserData(userId)]).then(values => {
      wx.hideLoading();
      values[0].power.forEach(val => {
        if (values[1].power.includes(val.code)) {
          val.checked = true;
        }
      })
      values[0].role.forEach(val => {
        if (values[1].role.includes(val.code)) {
          val.checked = true;
        }
      })
      this.setData({
        userId: values[1]._id,
        userName: values[1].name,
        power: values[0].power,
        role: values[0].role,
      })
    })
  },
  loadRole() {
    wx.showLoading({
      title: '加载中...',
    })
    return new Promise((reslove, reject) => {
      service.getPowerRole(['role', 'power']).then(powerRole => {
        reslove(powerRole);
      })
    })
  },
  loadUserData(_id) {
    return new Promise((reslove, reject) => {
      service.queryUser(_id).then(user => {
        reslove(user);
      })
    })
  },
  submit: function(e) {
    if (e.detail.value.userName === '' || e.detail.value.power.length === 0) {
      wx.showModal({
        title: '提示',
        content: '用户名字和权限都不能为空',
      })
      return;
    }
    wx.showLoading({
      title: '正在修改中...',
    })
    service.editUser({
      _id: e.detail.value.userId,
      data: {
        name: e.detail.value.userName,
        power: e.detail.value.power,
        role: e.detail.value.role
      }
    }).then(() => {
      wx.hideLoading();
      wx.navigateBack();
    }, error => {
      wx.showToast({
        title: '请先修改用户信息',
        icon: 'none',
        duration: 2000
      })
    })
    userInfo._id = e.detail.value.userId;
    userInfo.name = e.detail.value.userName;
    userInfo.power = e.detail.value.power;
    userInfo.role = e.detail.value.role
  },
  checkboxChange(e) {

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