// src/pages/manage/roleDetail/roleDetail.js
const service = require('../../service.js');
let allRole = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: '',
    role: [],
    userList: [],
    Publisher: [],
    Observer: [],
    Participant: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadRole().then(() => {
      this.loadData(this.data.currentTab);
    });

  },
  switchTab(e) {
    const currentTab = e.currentTarget.id;
    const reloadTrigger = getApp().globalData.managerHomeRoleManage;
    let data = {
      currentTab
    }
    if (reloadTrigger[currentTab] === true) {
      this.loadData(currentTab);
    } else {
      data = {
        currentTab,
        userList: this.data[currentTab]
      }
    }
    this.setData({
      ...data
    })

  },
  loadRole() {
    let reloadTrigger = getApp().globalData.managerHomeRoleManage;
    return new Promise((reslove, reject) => {
      service.getPowerRole().then(powerRole => {
        reslove(powerRole);
        allRole = powerRole.role;
        let role = powerRole.role
        this.setData({
          role,
          currentTab: role[0].code
        });
        for (let i in role) {
          reloadTrigger[role[i].code] = true;
        }
      })
    })
  },
  loadData(role) {
    let reloadTrigger = getApp().globalData.managerHomeRoleManage;

    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    service.getUserList({
      role: [role]
    }).then(userList => {
      this.setData({
        userList: userList.data,
        [role]: userList.data
      })
      wx.hideLoading();
      reloadTrigger[role] = false
    })


  },
  addRoleUser() {
    wx.navigateTo({
      url: '../addRoleUser/addRoleUser?role=' + this.data.currentTab 
    })
  },
  deleteUserRole(e) {
    let currentTab = this.data.currentTab
    let newUserList = [...this.data.userList]
    let _this = this;
    let _id = e.currentTarget.dataset.deleteid
    wx.showModal({
      title: '提示',
      content: '是否取消用户的角色',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '取消用户角色中...',
            mask: true
          })
          service.editUser({
            _id,
            data: {
              role: currentTab
            },
            action: 'removeRole'
          }).then(() => {
            
            newUserList = newUserList.filter(e => {
              if (e._id !== _id) {
                return {
                  ...e
                }
              }
            })
            _this.data[_this.data.currentTab] = newUserList;
            _this.setData({
              userList: newUserList
            })
            wx.hideLoading();
          })
        }
      }
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let userList = this.data.userList;
    const reloadTrigger = getApp().globalData.managerHomeRoleManage;
    if (userList === '' || reloadTrigger.userName === '' || reloadTrigger.userId === '') {
      return;
    }
    userList.push({
      _id: reloadTrigger.userId,
      name: reloadTrigger.userName
    })
    this.setData({
      userList
    })
    reloadTrigger.userName = '';
    reloadTrigger.userId = '';
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    const reloadTrigger = getApp().globalData.managerHomeRoleManage;
    reloadTrigger.userName = '';
    reloadTrigger.userId = '';
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})