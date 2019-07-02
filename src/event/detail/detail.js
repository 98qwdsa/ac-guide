// src/event/detail/detail.js
const service = require('../service.js');
let code = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    eventDetail: {},
    code: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //console.log(options);
    code = options.code;
    this.loadData(code);
  },
  loadData(code) {
    wx.showLoading({
      mask: true
    })
    Promise.all([this.getEventDetail(code), this.getEventSteps(code)]).then(data => {
      wx.hideLoading();
      this.setData({
        code,
        ['eventDetail']: {
          ...data[0],
          steps: data[1],
        }
      })
    });
  },
  getEventDetail(code) {
    return new Promise((reslove, reject) => {
      service.getEventDetail(code).then(data => {
        reslove(data[0]);
      });
    })
  },
  getEventSteps(code) {
    return new Promise((reslove, reject) => {
      service.getEventSteps(code).then(data => {
        reslove(data);
      })
    })
  },
  deleteStep(e) {
    const data = e.target.dataset;
    const newEventList = [...this.data.eventDetail.steps]
    newEventList.splice(data.index, 1);
    wx.showLoading({
      mask: true
    })
    service.deleteEventStep(code, data._id).then(data => {
      wx.hideLoading();
      this.setData({
        ['eventDetail.steps']: newEventList
      })
    })
  },
  submit(e) {
    console.log(e);
  },
  eventTrigger(e) {
    wx.showLoading({
      mask: true
    })
    const data = e.target.dataset;
    service.eventTrigger(data).then(res => {
      wx.hideLoading();
      if (res.updated > 0) {
        this.setData({
          ['eventDetail.disabled']: !data.disabled
        })
      }
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