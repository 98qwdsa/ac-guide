const cloud = require('../../service/cloud.js');
const cloudFileConf = {
  PATH: 'steps_attachments/'
}
module.exports = {
  checkUserInfo() {
    return cloud.call('checkUserInfo');
  },
  getEventList() {
    return cloud.call('queryEventList');
  },
  getEventList() {
    return cloud.call('queryEventList');
  },
  getSelfEventStep(code) {
    return cloud.call('queryUserEventDetail', {
      code
    });
  },
  nextStep(code, step_Uid, lastStep = false) {
    return cloud.call('employeeAddStep', {
      code,
      step_Uid,
      status_code: 50,
      lastStep
    })
  },
  confirmStep(code, step_Uid, participant_uid, lastStep = false) {
    return cloud.call('employeeAddStep', {
      code,
      step_Uid,
      status_code: 100,
      participant_uid,
      lastStep
    })
  },
  getQueryObserverEventDetail(data) {
    return cloud.call('queryObserverEventDetail', {
      ...data
    });
  },
  getUserObserver(data) {
    return cloud.call('queryUserObserver', {
      ...data
    })
  },
  editObserverForUser(data) {
    return cloud.call('editObserver', {
      ...data
    })
  },
  getQueryAllUserEventDetail(data) {
    return cloud.call('queryAllUserEventDetail', {
      ...data
    });
  },
  getAllObserver() {
    return cloud.call('queryAllObserver', {})
  },

  getPowerRole(types, open_id = undefined) {
    return cloud.call('getPowerRole', {
      open_id,
      types
    })
  }

}