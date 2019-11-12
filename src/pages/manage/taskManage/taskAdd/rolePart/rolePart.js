let taskAdd = getApp().globalData.managerHomeTaskManagerTaskAdd;
const service = require('../../../service.js');
let roleChecked = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roles:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    roleChecked = options.role;
    this.loadRole();
  },
  loadRole(){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    service.getPowerRole().then(data =>{
      data.role.forEach(function(val){
        if (roleChecked.includes(val.code)){
          val.checked = true;
        }else{
          val.checked = false; 
        }
      });
      this.setData({
        roles: data.role
      })
      wx.hideLoading();
    });
  },
  checkboxChange: function (e) {
    taskAdd.roles = e.detail.value;
  },
  submit: function(e){
    wx.navigateBack({
      delta: 1
    });
  }
})