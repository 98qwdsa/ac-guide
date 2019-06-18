const could = require('./could.js');
const couldFileConf = {
  PATH: 'steps_attachments/'
}
module.exports = {
  checkUserInfo() {
    return could.call('checkUserInfo');
  },
  register(data) {
    return could.call('addUser', data);
  },
  getEventList() {
    return could.call('queryEventList');
  },
  getSelfEventStep(code) {
    return could.call('queryUserEventDetail', {
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
                cloudPath: couldFileConf.PATH + e.name,
                filePath: e.path
              })
            })
            uploadFile(files).then(res => {
              setRecord(res).then(res1 => {
                reslove(res);
              });
            });
          }
        },
        fail(e) {
          console.log(e);
        }
      })
    });

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
      })
    }

    function setAttachmentRecord(res) {
      let data = [];
      res.forEach(e => {
        data.push({
          step_Uid,
          file_url: e.fileId
        })
      });
      return new Promise((reslove, reject) => {
        wx.cloud.callFunction({
          name: '',
          data
        }).then(res => {
          if (res.result.code === '0000') {
            reslove(res.data)
          }
        })
      })
    }
  },
  nextStep(code, step_Uid) {
    return cloud.call('employeeAddAttachments', {
      code,
      step_Uid,
      verified: 50
    })
  }
}