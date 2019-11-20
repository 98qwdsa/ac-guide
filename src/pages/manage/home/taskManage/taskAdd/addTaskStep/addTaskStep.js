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
  bindNameInput: function(e){
    taskAdd.stepName = e.detail.value;
  },
  formSubmit: function(e){
    wx.navigateBack({
      delta: 1
    })
  }

})