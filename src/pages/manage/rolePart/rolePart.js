const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [
      { name: 'F19', value: 'F19', number:'22', checked: false },
      { name: 'F20', value: 'F20', number: '17', checked: false },
      { name: 'PM', value: 'PM', number: '3', checked: false }
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.items.forEach(function (val) {
      if (options.role.includes(val.value)) {
        val.checked = true;
      } else {
        val.checked = false; 
      }
    });
    this.setData({
      items: this.data.items
    });
  },
  checkboxChange: function (e) {
    app.globalData.roles = e.detail.value;
  },
  submit: function(e){
    wx.navigateBack({
      delta: 1
    });
  }
})