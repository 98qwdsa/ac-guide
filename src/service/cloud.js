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
          console.group(`[${name}] cloud internal error`)
          console.error(...arguments, res.result)
          console.groupEnd()
        } else {
          wx.hideLoading();
          console.group(`[${name}] error`)
          console.error(...arguments, res.result)
          console.groupEnd()
          reject(res.result);
        }
      }).catch(e => {
        console.group(`[${name}] error`)
        console.error(e)
        console.groupEnd()
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