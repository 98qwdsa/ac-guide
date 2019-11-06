const service = require('../service.js');
const app = getApp();
let detail = {
  code: '',
  name: '',
  desc: '',
  disabled: true,
  role: [],
  steps: []
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    eventDetail: {
      role: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.setData({
      eventDetail: {
        ...detail,
        disabled: true
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let taskAdd = getApp().globalData.managerHomeTaskManagerTaskAdd;
    if (taskAdd.roles.length) {
      detail.role = taskAdd.roles;
      taskAdd.roles = [];
    }
    if (taskAdd.stepIndex) {
      if (taskAdd.stepName) {
        detail.steps[taskAdd.stepIndex] = taskAdd.stepName;
        taskAdd.stepName = '';
        taskAdd.stepIndex = 0;
      }
    } else {
      if (taskAdd.stepName) {
        detail.steps.push(taskAdd.stepName);
        taskAdd.stepName = '';
      }
    }
    this.setData({
      eventDetail: detail
    })
  },
  submit: function(e) {
    console.log('form发生了submit事件，携带的数据:', e.detail.value);
    if (e.detail.value.code == "" || e.detail.value.name == "" ) {
      wx.showModal({
        title: '提示',
        content: '事件编码和事件名称都不能为空',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return;
    }
    // service.addEvent(e.detail.value).then(() => {
    //   wx.navigateTo('../taskManage/taskManage');
    //   detail = {
    //     code: '',
    //     name: '',
    //     desc: '',
    //     disabled: true,
    //     role: [],
    //     steps: []
    //   };
    //   this.setData({
    //     eventDetail: detail
    //   });
    // });
  },
  formReset: function() {
    detail = {
      code: '',
      name: '',
      desc: '',
      disabled: true,
      role: [],
      steps: []
    };
    this.setData({
      eventDetail: detail
    });
    wx.showToast({
      title: '消息已重置成功',
      icon: 'success',
      duration: 2000
    })
  },
  codeBindblur: function(e) {
    detail.code = e.detail.value;
  },
  nameBindblur: function(e) {
    detail.name = e.detail.value;
  },
  descBindblur: function(e) {
    detail.desc = e.detail.value;
  },
  switchChange: function(e) {
    detail.disabled = e.detail.value;
  },
  deleteTaskStep: function(e) {
    detail.steps = detail.steps.filter(function(item) {
      return (item !== e.currentTarget.dataset.steptask);
    });
    this.setData({
      eventDetail: detail
    });
  },
  editTaskStep: function(e) {
    wx: wx.navigateTo({
      url: '../addTaskStep/addTaskStep?stepname=' +
        e.currentTarget.dataset.steptask +
        '&&stepindex=' + e.currentTarget.dataset.stepindex
    })
  }
})