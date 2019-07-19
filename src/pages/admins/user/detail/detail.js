// src/admins/user/detail/detail.js
const service = require('../../service.js');
let _id = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options);
    if (options._id) {
      _id = options._id;
      this.loadData(options._id);
    } else {
      wx.showModal({
        title: '错误！！',
        content: '缺少参数',
        success(res) {
          wx.navigateBack();
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  loadData(_id) {
    wx.showLoading({
      mask: true,
    })
    Promise.all([this.getUserInfo(_id), this.getPwoerRoleList()]).then(data => {
      wx.hideLoading();
      const power = data[1].power.map(e => {
        const checked = data[0].power.indexOf(e.code) > -1;
        return {
          ...e,
          checked
        }
      })
      const role = data[1].role.map(e => {
        const checked = data[0].role.indexOf(e.code) > -1;
        return {
          ...e,
          checked
        }
      })
      this.setData({
        userInfo: data[0],
        power,
        role
      })
    })
  },
  getUserInfo(_id) {
    return new Promise((reslove, reject) => {
      service.queryUser(_id).then(userInfo => {
        reslove(userInfo);
      });
    })
  },
  getPwoerRoleList() {
    return new Promise((reslove, reject) => {
      service.getPowerRoleList().then(data => {
        reslove(data);
      });
    })
  },
  submit(e) {
    wx.showLoading({
      mask: true
    })
    service.editUser({
      _id,
      data: {
        ...e.detail.value
      }
    }).then(data => {
      wx.hideLoading();
      console.log(data);
    });
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