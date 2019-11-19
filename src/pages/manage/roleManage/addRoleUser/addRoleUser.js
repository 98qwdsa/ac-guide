// src/pages/manage/addRole/addRole.js
const service = require('../../service.js');
const reloadTrigger = getApp().globalData.managerHomeRoleManage;
let role = '';
let num = 0;
let delay = 500;
let timer = {};
let userRoleList = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userList: [],
    searchInput: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    role = options.role;
    this.loadData(role);
  },
  loadData(role){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    service.getUserList({
      filterRoles: [role]
    }).then(data =>{
      this.setData({
        userList: data.data
      })
      userRoleList = data.data;
      wx.hideLoading();
    },error =>{
      this.setData({
        userList: []
      })
    })
  },
  addUser(e){
    let newUserList = userRoleList;
    let _this = this;
    let target = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '是否添加该成员',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '增加用户角色中...',
            mask: true
          })
          service.editUser({
            _id: e.currentTarget.dataset.adduserid,
            data: {
              role: [role]
            },
            action: 'addRole'
          }).then(() => {
            reloadTrigger.user.push({
              name: target.addusername,
              id: target.adduserid
            })
            // reloadTrigger.user = target.addusername;
            // reloadTrigger.userId = target.adduserid;
            newUserList = newUserList.filter(e =>{
              if(e._id !== target.adduserid){
                return {
                  ...e
                }
              }
            })
            _this.setData({
              userList: newUserList,
              searchInput: ''
            })
            userRoleList = newUserList;
            wx.hideLoading();
          });
        } else if (res.cancel) {

        }
      }
    })  
  },
  bindKeyInput: function(e){
    let _this = this;
    let userName = '';
    num = 0;
    clearInterval(timer);
    timer = setInterval(() =>{
      num += 100
      if(num > delay){
        let name = e.detail.value
        num = 0
        clearInterval(timer)
        if (name){
          _this.loadUserByName(name);
        }else{
          _this.loadData(role);
        }
          
      }
    },100)
  },
  loadUserByName(name){
    wx.showLoading({
      title: '搜索用户中...',
      mask: true
    })
    service.getUserList({
      name,
      role: [role],
      action: 'userInRole'
    }).then((userList) =>{
      this.setData({
        userList:userList.data
      })
      wx.hideLoading();
    },error =>{
      this.setData({
        userList: []
      })
    })
  },
  deleteInputText(){
    this.setData({
      searchInput: ''
    })
    this.loadData(role);
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