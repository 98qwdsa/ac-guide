// src/pages/manage/taskProgress/taskProgress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    allUserList: [
      {
        userImg:'../../asset/hr_guide3.png',
        user: '张瑶Andy',
        progress: 25,
        cancel: true,
        add: true,
        followerImg: ['../../asset/hr_guide3.png',
        '../../asset/hr_guide3.png']
      },
      {
        userImg: '../../asset/hr_guide3.png',
        user: '颜文妆',
        progress: 50,
        cancel: true,
        add: true,
        followerImg: ['../../asset/hr_guide3.png',
         '../../asset/hr_guide3.png', '../../asset/hr_guide3.png']
      },
      {
        userImg: '../../asset/hr_guide3.png',
        user: '张瑶Andy',
        progress: 100,
        cancel: true,
        add: true,
        followerImg: ['../../asset/hr_guide3.png']
      }
    ],
    attenUserList: [
      {
        userImg: '../../asset/hr_guide3.png',
        user: '张瑶Andy',
        progress: 75,
        cancel: true,
        add: true,
        followerImg: ['../../asset/hr_guide3.png',
          '../../asset/hr_guide3.png']
      },
      {
        userImg: '../../asset/hr_guide3.png',
        user: '颜文妆',
        progress: 25,
        cancel: true,
        add: true,
        followerImg: ['../../asset/hr_guide3.png',
          '../../asset/hr_guide3.png', '../../asset/hr_guide3.png']
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  switchTab(e) {
    console.log(e)
    let tab = e.currentTarget.id
    if (tab === 'tableft') {
      this.setData({ currentTab: 0 })
    } else if (tab === 'tabmiddle') {
      this.setData({ currentTab: 1 })
    } else if (tab === 'tabright') {
      this.setData({ currentTab: 2 })
    } 
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