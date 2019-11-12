// src/pages/manage/roleDetail/roleDetail.js
const service = require('../../service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 'Publisher',
    userList:[],
    role:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadRole();
    this.loadData(['Publisher']);
  },
  switchTab(e){
    let currentTab = e.currentTarget.id;
    this.setData({
      currentTab
    });
    this.loadData(currentTab.split(" "));
    
  },
  loadData(roles){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    service.getUserList({role:roles}).then(userList => {
      this.setData({
        userList: userList.data
      })
      wx.hideLoading();
    })
  },
  addRoleUser(){
    wx.navigateTo({
      url: '../addRoleUser/addRoleUser',
    })
  },
  deleteUser(e) {
    let _this = this;
    let newUserList = [...this.data.userList]
    let _id = e.currentTarget.dataset.deleteid
    wx.showModal({
      title: '提示',
      content: '是否删除用户',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除用户中...',
            mask: true
          })
          service.deleteUser({
            _id
          }).then(() => {
            newUserList = newUserList.filter(e => {
              if (e._id !== _id) {
                return {
                  ...e
                }
              }
            })
            _this.setData({
              userList: newUserList
            })
            wx.hideLoading();
          })
        }
      }
    })
  },
  loadRole(){
    service.getPowerRole().then(powerRole =>{
      this.setData({
        role: powerRole.role
      });
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let reloadTrigger = getApp().globalData.managerHomeRoleManage;
    reloadTrigger.left = true;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})