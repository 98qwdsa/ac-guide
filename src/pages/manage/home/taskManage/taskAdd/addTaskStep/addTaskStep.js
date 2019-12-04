let taskAdd = getApp().globalData.managerHomeTaskManagerTaskAddTaskStep;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepName: '',
    tips: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    taskAdd.step.name = options.stepname;
    taskAdd.step.index = options.stepindex;
    if (options.steptips){
      taskAdd.step.tips = options.steptips.split(',');
    }
  },
  onShow: function() {
    let step = {};
    if (taskAdd.step.name) {
      step = {
        ...step,
        stepName: taskAdd.step.name
      }
    }
    if (taskAdd.step.tips) {
      step = {
        ...step,
        tips: taskAdd.step.tips
      }
    }
    this.setData({
      ...step
    });
  },
  formSubmit(e) {
    taskAdd.step.name = e.detail.value.stepName;
    taskAdd.step.tips = this.data.tips;
    wx.navigateBack()
  },
  formReset(e) {
    wx.navigateBack();
  },
  deleteText(e) {
    this.setData({
      stepName: ''
    })
  },
  addTips(e) {
    this.data.tips.push('');
    this.setData({
      tips: this.data.tips
    })
  },
  inputedit(e){
    let value = e.detail.value;
    let index = e.currentTarget.dataset.tipindex;
    this.data.tips[index] = value;
  },
  deleteTips(e){
    let _this = this;
    let index = e.currentTarget.dataset.tipsindex;
    wx.showModal({
      title: '提示',
      content: '是否删除该tips',
      success(res) {
        if (res.confirm) {
          _this.data.tips.splice(index, 1);
          _this.setData({
            tips: _this.data.tips
          })
        } 
      }
    })
  }
})

