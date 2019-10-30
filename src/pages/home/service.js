const cloud = require('../../service/cloud.js');
const cloudFileConf = {
  PATH: 'steps_attachments/'
}
module.exports = {
  getEventList() {
    return cloud.call('queryEventList');
  },
  getSelfEventStep(code) {
    return cloud.call('queryUserEventDetail', {
      code
    });
  },
  nextStep(code, step_Uid) {
    return cloud.call('employeeAddStep', {
      code,
      step_Uid,
      status_code: 50
    })
  }
  
}