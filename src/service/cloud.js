module.exports = {
  call(name, data) {
    return new Promise((reslove, reject) => {
      wx.cloud.callFunction({
        name,
        data
      }).then(res => {
        if (res.result.code === '0000') {
          reslove(res.result.data);
          // console.log(res.result.data);
        } else if (res.result.code >= '3000') {
          wx.showToast({
            mask: true,
            icon: 'none',
            title: 'cloud internal error',
            duration: 1500
          });
          console.log(...arguments, res.result);
        } else {
          wx.hideLoading();
          console.log(...arguments, res.result);
          reject(res.result);
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