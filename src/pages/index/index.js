const APP = getApp();
const service = require('../../service/business.js');
Page({
  data: {
    eventList: []
  },
  onLoad() {
    this.loadData();
  },
  eventClick(e) {
    wx.navigateTo({
      url: './user_event_steps/user_event_steps?code=' + e.currentTarget.dataset.data.code,
    })
  },
  loadData() {
    wx.showLoading({
      mask: true
    })
    service.getEventList().then(eventList => {
      this.setData({
        eventList
      })
      wx.hideLoading();
    })
  }
})