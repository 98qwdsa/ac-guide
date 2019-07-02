module.exports = {
  call(name, data) {
    return new Promise((reslove, reject) => {
      wx.cloud.callFunction({
        name,
        data
      }).then(res => {
        if (res.result.code === '0000') {
          reslove(res.result.data);
        } else if (res.result.code >= '3000') {
          wx.showToast({
            mask: true,
            icon: 'none',
            title: 'cloud internal error',
            duration: 1500
          });
          console.log(res.result);
        } else {
          wx.hideLoading();
          console.log(res.result);
        }
      }).catch(e => {
        console.log(e)
        wx.showToast({
          mask: true,
          icon: 'none',
          title: 'cloud.callFunction error',
          duration: 1500
        })
      })
    })
  },
}