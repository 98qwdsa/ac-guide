const cloud = require('../service/cloud.js');
const cloudFileConf = {
  PATH: 'steps_attachments/'
}
module.exports = {
  checkUserInfo() {
    return cloud.call('checkUserInfo');
  },
  register(data) {
    return cloud.call('addUser', data);
  },
  getEventList() {
    return cloud.call('queryEventList');
  },
  getSelfEventStep(code) {
    return cloud.call('queryUserEventDetail', {
      code
    });
  },
  uploadAttachments(code, Uid) {
    return new Promise((reslove, reject) => {
      wx.chooseMessageFile({
        count: 5,
        success(res) {
          if (res.errMsg === 'chooseMessageFile:ok') {
            let files = [];
            res.tempFiles.forEach(e => {
              files.push({
                cloudPath: cloudFileConf.PATH + e.name,
                filePath: e.path
              })
            })
            wx.showLoading({
              mask: true,
            })
            uploadFile(files).then(res => {
              setAttachmentRecord(res, Uid, code).then(res1 => {
                reslove(res1);
                console.log(res1);
                wx.hideLoading();
              });
            });
          }
        },
        fail(e) {
          console.log(e);
        }
      })
    });
    //上传云存储
    function uploadFile(files = []) {
      let funArr = [];
      files.forEach(e => {
        funArr.push(wx.cloud.uploadFile({
          ...e
        }))
      });

      return new Promise((reslove, reject) => {
        Promise.all(funArr).then(res => {
          console.log(res);

          /**
           * errMsg:"cloud.uploadFile:ok"
           * fileID:"cloud://demo-5c0mj.6465-demo-5c0mj-1259068995/steps_attachments/1558404883(1).png"
           * statusCode:200
           * 应该在单独封装一次上传方法，屏蔽statusCode 不等于200的场景
           */
          reslove(res);
        })
      }).catch(e => {
        console.log(e);
      })
    }
    //写入到云数据库
    function setAttachmentRecord(res, step_Uid, code) {
      let data = {
        code,
        step_Uid,
        files: []
      }
      res.forEach(e => {
        data.files.push({
          src: e.fileID,
          type: e.fileID.replace(/.+\./, '')
        })
      });
      return cloud.call('employeeAddAttachments', data)
    }
  },
  nextStep(code, step_Uid) {
    return cloud.call('employeeAddStep', {
      code,
      step_Uid,
      status_code: 50
    })
  },
  adminLogin(user, pwd) {
    return cloud.call('adminLogin', {
      user,
      pwd
    })
  }
}