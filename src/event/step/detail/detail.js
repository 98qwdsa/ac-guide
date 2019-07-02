// src/event/step/detail/detail.js
const service = require('../../service.js');
let _id = '';
let code = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepDetail: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    _id = options._id
    code = options.code
    console.log(options);
    this.loadData(options)
  },
  loadData(data) {
    wx.showLoading({
      mask: true
    })
    service.getEventStepDetail(data.code, data._id).then(stepDetail => {
      wx.hideLoading();
      this.setData({
        stepDetail
      })
    })
  },
  addTips() {
    const tips = [...this.data.stepDetail.tips]
    if (tips[tips.length - 1] === '') {
      return;
    }
    tips.push('');
    this.setData({
      ['stepDetail.tips']: tips
    });
  },
  removeTips(e) {
    const tips = [...this.data.stepDetail.tips]
    tips.splice(e.target.dataset.index, 1);
    this.setData({
      ['stepDetail.tips']: tips
    });
  },
  tipsChange(e) {
    this.setData({
      ['stepDetail.tips[' + e.target.dataset.index + ']']: e.detail.value
    });
  },
  deleteStep(e) {
    wx.showLoading({
      mask: true
    })
    service.deleteEventStep(code, _id).then(data => {
      wx.hideLoading();
      wx.showModal({
        content: '删除成功!!',
        showCancel: false,
        confirmText: '确定',
        success(res) {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      })
    })
  },
  submit(e) {
    setTimeout(() => {
      let stepDetail = e.detail.value;
      stepDetail.tips = stepDetail.tips.filter(e => {
        if (typeof(e) === 'string' && e != '') {
          return e;
        }
      })
      console.log(e);
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