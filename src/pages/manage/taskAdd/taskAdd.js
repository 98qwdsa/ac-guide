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
    if (app.globalData.roles.length) {
      detail.role = app.globalData.roles;
      app.globalData.roles = [];
    }
    if (app.globalData.stepIndex) {
      if (app.globalData.stepName) {
        detail.steps[app.globalData.stepIndex] = app.globalData.stepName;
        app.globalData.stepName = '';
        app.globalData.stepIndex = 0;
      }
    } else {
      if (app.globalData.stepName) {
        detail.steps.push(app.globalData.stepName);
        app.globalData.stepName = '';
      }
    }
    this.setData({
      eventDetail: detail
    })
  },
  submit: function(e) {
    console.log('form发生了submit事件，携带的数据:', e.detail.value);
    if (e.detail.value.code == "" || e.detail.value.name == "" || e.detail.value.desc == "") {
      wx.showModal({
        title: '提示',
        content: '事件编码、名称和描述都不能为空',
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
    service.addEvent(e.detail.value).then(() => {
      wx.navigateTo("../taskManage/taskManage");
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
    });
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
  bindCodeInput: function(e) {
    detail.code = e.detail.value;
  },
  bindNameInput: function(e) {
    detail.name = e.detail.value;
  },
  bindDescInput: function(e) {
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
  },
  checkboxTwoChange: function(e) {
    // detail.steps = e.detail.value;
  }
})