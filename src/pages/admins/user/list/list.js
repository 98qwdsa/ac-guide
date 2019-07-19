// src/admins/user/list/list.js
const service = require('../../service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData();
  },
  search(e) {
    const name = e.detail.value.name;
    console.log(name);
  },
  loadData(name) {
    wx.showLoading({
      mask: true
    })
    service.getUserList().then(userList => {
      this.setData({
        userList
      })
      wx.hideLoading();
    });
  },
  deleteUser(e) {
    console.log(e);
    const _id = e.currentTarget.dataset._id;
    const index = e.currentTarget.dataset.index;
    service.deleteUser(_id).then(data => {
      const userList = this.data.userList.splice(index, 0);
      this.setData({
        userList
      })
    });
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