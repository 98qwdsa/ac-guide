let taskAdd = getApp().globalData.managerHomeTaskManagerTaskAdd;
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
      taskAdd.stepName = options.stepname;
      taskAdd.stepIndex = options.stepindex;
      this.setData({
        stepName: options.stepname
      });
    }
  },
  formSubmit: function(e){
    taskAdd.stepName = e.detail.value.stepName;
    wx.navigateBack({
      delta: 1
    })
  },
  formReset: function(e){
    wx.navigateBack({
      delta: 1,
    });
  },
  deleteText: function(e){
    this.setData({
      stepName: ''
    })
  }

})