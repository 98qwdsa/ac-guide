const service = require('../../../service.js');
const app = getApp();
let detail = {
  code: '',
  name: '',
  desc: '',
  disabled: false,
  verifiers: [],
  role: [],
  steps: []
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    eventDetail: {
      verifiers: [],
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
    if (taskAdd.roles) {
      detail.role = taskAdd.roles;
      taskAdd.roles = [];
    }
    if (taskAdd.verifiers){
      detail.verifiers = taskAdd.verifiers; 
      taskAdd.verifiers = [];
    }
    
    if (taskAdd.step.index) {
      if (taskAdd.step.name) {
        let data = {};
        if (taskAdd.step.verifiers.length ===0){
          data = {
            title: taskAdd.step.name,
            tips: taskAdd.step.tips,
          }
        }else{
          data = {
            title: taskAdd.step.name,
            tips: taskAdd.step.tips,
            verifiers: taskAdd.step.verifiers
          }
        }
        detail.steps[taskAdd.step.index] = {
          ...data
        };
        taskAdd.step.name = '';
        taskAdd.step.index = 0;
        taskAdd.step.tips = [];
        taskAdd.step.verifiers = [];
      }
    } else {
      if (taskAdd.step.name) {
        let data = {};
        if (taskAdd.step.verifiers.length === 0) {
          data = {
            title: taskAdd.step.name,
            tips: taskAdd.step.tips,
          }
        } else {
          data = {
            title: taskAdd.step.name,
            tips: taskAdd.step.tips,
            verifiers: taskAdd.step.verifiers
          }
        }
        detail.steps.push({
          ...data
          }
        );
        taskAdd.step.name = '';
        taskAdd.step.index = 0;
        taskAdd.step.tips = [];
        taskAdd.step.verifiers = [];
      }
    }
    this.setData({
      eventDetail: detail
    })
  },
  submit: function(e) {
    const params = e.detail.value;
    if (params.code == "" || params.name == "" || params.role.length == 0) {
      wx.showToast({
        icon: 'none',
        title: '事件编码、事件名称和参与角色都不能为空',
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
      let reloadTrigger = getApp().globalData.managerHomeTaskManageTaskAdd;
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
        verifiers: [],
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
    let data = e.currentTarget.dataset;
    let verifiers = data.verifiers.map(e => {
      return `${e._id},${e.open_id},${e.name}`
    }).join('|');
    let verifiersId = data.verifierid.join('|');
    wx.navigateTo({
      url: 'addTaskStep/addTaskStep?stepname=' +
        data.steptask + '&stepindex=' + data.stepindex+
        '&steptips=' + data.steptips + '&verifierid=' + verifiersId +
        '&verifiers=' + verifiers
    })
  },
  eventVerifiers(e){
    let verifiers = e.currentTarget.dataset.verifiers.map(e => {
      return `${e._id}`
    }).join('|');
    wx.navigateTo({
      url: 'eventVerifiers/eventVerifiers?verifiers=' + verifiers,
    })
  },
  addTaskStep(e){
    let verifiers = e.currentTarget.dataset.verifiers.map( e =>{
      return `${e._id},${e.open_id},${e.name}`
    }).join('|');
    wx.navigateTo({
      url: 'addTaskStep/addTaskStep?verifiers=' + verifiers
    })
  },
  onUnload() {
    detail = {
      code: '',
      name: '',
      desc: '',
      disabled: false,
      verifiers: [],
      role: [],
      steps: []
    }
  }
})