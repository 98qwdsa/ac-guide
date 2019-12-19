// src/pages/manage/personManage/editUser/editUser.js
let userInfo = getApp().globalData.managerHomePersonManageEditUser;
const service = require('../../../service.js');
let userId = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    userName: '',
    power: [],
    role: [],
    init_loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    userId = options.userId;
    if (userId){
      this.editUser(userId);
    }else{
      this.addUser();
    }
  },
  addUser(){
    this.loadRole().then(powerRole =>{
      this.setData({
        power: powerRole.power,
        role: powerRole.role,
        init_loading: false
      })
      wx.hideLoading();
    },e =>{
      this.setData({
        init_loading: false
      })
    })
  },
  editUser(userId) {
    this.setData({
      init_loading: true
    })
    Promise.all([this.loadRole(), this.loadUserInfo(userId)]).then(values => {
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
        init_loading: false
      })
    }, e => {
      this.setData({
        init_loading: false
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
  loadUserInfo(_id) {
    return new Promise((reslove, reject) => {
      service.queryUser(_id).then(user => {
        reslove(user);
      })
    })
  },
  submit: function(e) {
    if (e.detail.value.userName === '' || e.detail.value.role.length === 0) {
      wx.showModal({
        title: '提示',
        content: '用户名字和角色都不能为空',
      })
      return;
    }
    if (userId) {
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
    }else{
      wx.navigateBack();
    }
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
    userId = '';
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