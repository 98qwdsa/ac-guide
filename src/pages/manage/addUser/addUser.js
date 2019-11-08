// src/pages/manage/addUser/addUser.js
const service = require('../service.js');
let reloadTrigger = getApp().globalData.managerHomePersonManage;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  formSubmit: function(e){
    if (e.detail.value.userName == "") {
      wx.showModal({
        title: '提示',
        content: '名字不能为空',
        success(res) {
          if (res.confirm) {
          } else if (res.cancel) {
          }
        }
      })
      return;
    }
    service.addUser(e.detail.value.userName).then(()=>{
      reloadTrigger.mid = true;
      wx.navigateBack();
    })
  },
  formReset:function(){
    this.setData({
      userName: []
    });
    wx.showToast({
      title: '姓名已重置成功',
      icon: 'success',
      duration: 2000
    })
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