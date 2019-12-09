const service = require('../../../service.js');
const app = getApp();
let detail = {
  code: '',
  name: '',
  desc: '',
  disabled: false,
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
        disabled: false
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let taskAdd = getApp().globalData.managerHomeTaskManagerTaskAddTaskStep;
    if (taskAdd.roles.length) {
      detail.role = taskAdd.roles;
      taskAdd.roles = [];
    }
    if (taskAdd.step.index) {
      if (taskAdd.step.name) {
        detail.steps[taskAdd.step.index] = {
          title: taskAdd.step.name,
          tips: taskAdd.step.tips
        };
        taskAdd.step.name = '';
        taskAdd.step.index = 0;
        taskAdd.step.tips = [];
      }
    } else {
      if (taskAdd.step.name) {
        detail.steps.push({
            title: taskAdd.step.name,
            tips: taskAdd.step.tips
          }
        );
        taskAdd.step.name = '';
        taskAdd.step.index = 0;
        taskAdd.step.tips = [];
      }
    }
    this.setData({
      eventDetail: detail
    })
  },
  submit: function(e) {
    const params = e.detail.value;
    if (params.code == "" || params.name == "") {
      wx.showToast({
        icon: 'none',
        title: '事件编码和事件名称都不能为空',
      });
      return;
    }
    wx.showLoading({
      title: '添加事件中...',
      mask: true
    })
    params.steps = detail.steps;
    service.addEvent(params).then(() => {
      wx.hideLoading();
      let reloadTrigger = getApp().globalData.managerHomeTaskManageTaskAdd
      reloadTrigger.load = true;
      wx.navigateBack();
    });
  },
  formReset: function() {
    this.setData({
      eventDetail: {
        code: '',
        name: '',
        desc: '',
        disabled: false,
        role: [],
        steps: []
      }
    });
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
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '是否删除该步骤',
      success(res) {
        if (res.confirm) {
          detail.steps = detail.steps.filter(function(item) {
            return (item.title !== e.currentTarget.dataset.steptask);
          });
          _this.setData({
            eventDetail: detail
          });
        }
      }
    })
  },
  editTaskStep: function(e) {
    wx.navigateTo({
      url: 'addTaskStep/addTaskStep?stepname=' +
        e.currentTarget.dataset.steptask +
        '&stepindex=' + e.currentTarget.dataset.stepindex+
        '&steptips=' + e.currentTarget.dataset.steptips
    })
  },
  onUnload() {
    detail = {
      code: '',
      name: '',
      desc: '',
      disabled: false,
      role: [],
      steps: []
    }
  }
})