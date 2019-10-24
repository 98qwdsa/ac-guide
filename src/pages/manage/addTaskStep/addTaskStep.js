const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.stepindex && options.stepname){
      app.globalData.stepName = options.stepname;
      app.globalData.stepIndex = options.stepindex;
      this.setData({
        stepName: options.stepname
      });
    }
  },
  bindNameInput: function(e){
    app.globalData.stepName = e.detail.value;
  },
  formSubmit: function(e){
    wx.navigateBack({
      delta: 1
    })
  }

})