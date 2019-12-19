let taskAdd = getApp().globalData.managerHomeTaskManagerTaskAddTaskStep;
const service = require('../../../../service.js');
let verifiers = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    observer: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    verifiers = options.verifiers.split('|');
    this.loadObserver();
  },
  loadObserver(){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    service.getUserList({
      role: ['Observer']
    }).then(observer =>{

      observer.data.forEach(function (val) {
        if (verifiers.includes(val._id)) {
          val.checked = true;
        } else {
          val.checked = false;
        }
      }); 
      this.setData({
        observer: observer.data
      })
      wx.hideLoading();
    })
  },
  checkboxChange(e){
    taskAdd.verifiers = this.data.observer.filter(item =>{
      if (e.detail.value.includes(item._id)){
        return item
      }
    })
  },
  submit(e){
    wx.navigateBack();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    verifiers = [];
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})