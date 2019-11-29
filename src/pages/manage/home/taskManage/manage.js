const service = require('../../service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskDetailList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},
  loadData() {
    return new Promise((reslove, reject) => {
      wx.showLoading({
        mask: true,
      })
      service.getEventList().then(taskDetailList => {
        this.setData({
          taskDetailList
        })
        wx.hideLoading();
      }, error => {
        if (error.code === '2003') {
          wx.showToast({
            title: '无事件',
            icon: 'none',
            duration: 2000
          })
        }
      });
    })
  },
  taskAdd() {
    wx.navigateTo({
      url: 'taskAdd/taskAdd'
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
    let reloadTrigger = getApp().globalData.managerHomeTaskManageTaskAdd
    if (reloadTrigger.load === false) {
      return;
    }
    this.loadData().then(() => {
      reloadTrigger.load = false;
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    getApp().globalData.managerHomeTaskManageTaskAdd.load = true
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

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