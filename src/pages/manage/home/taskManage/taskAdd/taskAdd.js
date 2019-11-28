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
    params.steps = params.steps.map(e => ({
      title: e
    }))
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
            return (item !== e.currentTarget.dataset.steptask);
          });
          _this.setData({
            eventDetail: detail
          });
        }
      }
    })
  },
  editTaskStep: function(e) {
    wx: wx.navigateTo({
      url: 'addTaskStep/addTaskStep?stepname=' +
        e.currentTarget.dataset.steptask +
        '&&stepindex=' + e.currentTarget.dataset.stepindex
    })
  }
})