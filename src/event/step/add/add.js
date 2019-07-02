// src/event/step/add/add.js
const service = require('../../service.js');
let code = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tips: ['']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    code = options.code;
  },
  addTips() {
    const tips = [...this.data.tips]
    if (tips[tips.length - 1] === '') {
      return;
    }
    tips.push('');
    this.setData({
      tips
    });
  },
  removeTips(e) {
    const tips = [...this.data.tips]
    tips.splice(e.target.dataset.index, 1);
    this.setData({
      tips
    });
  },
  tipsChange(e) {
    this.setData({
      ['tips[' + e.target.dataset.index + ']']: e.detail.value
    });
  },
  submit(e) {
    setTimeout(() => {
      let stepDetail = e.detail.value;
      stepDetail.tips = stepDetail.tips.filter(e => {
        if (typeof(e) === 'string' && e != '') {
          return e;
        }
      })
      console.log(stepDetail);

      wx.showLoading({
        mask: true,
      })
      service.addSteps(code, stepDetail).then(data => {
        wx.hideLoading();
        wx.showModal({
          content: '添加成功!!',
          showCancel: false,
          confirmText: '确定',
          success(res) {
            if (res.confirm) {
              wx.navigateBack();
            }
          }
        })
      })
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