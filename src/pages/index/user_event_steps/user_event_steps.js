// src/pages/index/user_event_steps/user_event_steps.js
const service = require('../../../service/business.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepList: [],
    curIndex: 0,
    event_code: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadData(options.code);
  },
  loadData(code) {
    wx.showLoading({
      mask: true,
    })
    service.getSelfEventStep(code).then(stepList => {
      this.setData({
        stepList,
        event_code: code
      })
      console.log(stepList);
      wx.hideLoading();
    })
  },
  swiperChange(e) {
    this.setData({
      curIndex: e.detail.current
    })
  },
  uploadAttachment(e) {
    service.uploadAttachments();
  },
  nextStep(e) {
    const dataSet = e.currentTarget.dataset;
    service.nextStep(dataSet.code, dataSet.uid).then(data => {
      console.log(data);
    })
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