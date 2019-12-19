let taskAdd = getApp().globalData.managerHomeTaskManagerTaskAddTaskStep;
const service = require('../../../../service.js');
let roleChecked = [];
let role = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roles: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    roleChecked = options.role.split(',');
    this.loadRole();
  },
  loadRole() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    service.getPowerRole(['role']).then(data => {
      data.role.forEach(function(val) {
        if (roleChecked.includes(val.label)) {
          val.checked = true;
        } else {
          val.checked = false;
        }
      });
      this.setData({
        roles: data.role
      })
      wx.hideLoading();
    });
  },
  checkboxChange: function(e) {
    role = e.detail.value;
    taskAdd.roles = this.data.roles.filter(item => {
      if (e.detail.value.includes(item.code)) {
        return item
      }
    })
  },
  submit: function(e) {
    if (role.length){
      wx.navigateBack();
    }else{
      wx.showToast({
        title: '请选择一个角色',
        icon: 'none'
      })
    }
  },
  onUnload(){
    roleChecked = [];
    role = [];
  }

})