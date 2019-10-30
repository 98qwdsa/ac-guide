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
  }
}