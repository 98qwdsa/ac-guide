const cloud = require('../../service/cloud.js');
const cloudFileConf = {
  PATH: 'steps_attachments/'
}
module.exports = {
  register(data) {
    return cloud.call('addUser', data);
  }
}