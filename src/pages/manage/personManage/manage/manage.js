const service = require('../../service.js');
let num = 0;
let delay = 300;
let timer = {};
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
  onLoad: function(options) {
    this.loadData();
  },
  loadData(name) {
    return new Promise((reslove, reject) => {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      service.getUserList({
        name
      }).then(userList => {
        reslove();
        this.setData({
          userList: userList.data
        })
        wx.hideLoading();
      })
    })
  },
  deleteText(){
    this.setData({
      searchInput: ''
    })
    this.loadData();
  },
  addUser() {
    wx.navigateTo({
      url: '../addUser/addUser',
    })
  },
  deleteUser(e) {
    let _this = this;
    let newUserList = [...this.data.userList]
    let _id = e.currentTarget.dataset.deleteid
    wx.showModal({
      title: '提示',
      content: '是否删除用户',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除用户中...',
            mask: true
          })
          service.deleteUser({
            _id
          }).then(() => {
            newUserList = newUserList.filter(e => {
              if (e._id !== _id) {
                return {
                  ...e
                }
              }
            })
            _this.setData({
              userList: newUserList,
              searchInput: ''
            })
            _this.loadData();
            wx.hideLoading();
          })
        }
      }
    })

  },
  bindKeyInput: function(e) {
    let _this = this;
    num = 0;
    clearInterval(timer);
    timer = setInterval(() => {
      num += 100
      if (num >= delay) {
        num = 0
        clearInterval(timer);
        _this.loadData(e.detail.value);
      }
    }, 100)
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
    let trigger = getApp().globalData.managerHomePersonManageAddUser;
    if (trigger.userName === ''){
      return;
    }
    let userList = [...this.data.userList];
    service.addUser(trigger.userName).then(_id => {
      userList.push({
        _id,
        name: trigger.userName
      })
      this.setData({
        userList
      })
      trigger.userName = ''
    }); 
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