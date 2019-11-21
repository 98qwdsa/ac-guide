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
    power: [{
        name: 'account_admin',
        checked: false
      },
      {
        name: 'event_admin',
        checked: false
      }
    ],
    role: [{
      name: 'Observer',
      checked: false
    },
    {
      name: 'Participant',
      checked: false
    },
    {
      name: 'Publisher',
      checked: false
    }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let power = options.power.split(',');
    let role = options.role.split(',');
    this.data.power.forEach(function(val){
      if (power.includes(val.name)){
        val.checked = true;
      }
    })
    this.data.role.forEach(function (val) {
      if (role.includes(val.name)) {
        val.checked = true;
      }
    })
    this.setData({
      userId: options.userId,
      userName: options.userName,
      power: this.data.power,
      role: this.data.role
    })
  },
  submit:function(e){
    if (e.detail.value.userName === '' || e.detail.value.power.length === 0){
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
      data:{
        name: e.detail.value.userName,
        power: e.detail.value.power,
        role: e.detail.value.role
      }
    }).then(()=>{
      wx.hideLoading();
      wx.navigateBack();
    },error =>{
      wx.showModal({
        title: '提示',
        content: '请修改用户信息',
        success: function(res) {},
        fail: function(res) {},
      })
    })
    userInfo._id = e.detail.value.userId;
    userInfo.name = e.detail.value.userName;
    userInfo.power = e.detail.value.power;
    userInfo.role = e.detail.value.role
  },
  checkboxChange(e){

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