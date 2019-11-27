// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
// 检查参数
function checkParams(data) {
  let {
    OPENID
  } = cloud.getWXContext()
  let {
    code,
    step_Uid,
    files
  } = data;
  const res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (code === undefined) {
    res.code = '1000';
    res.msg.push('code:string');
  } else {
    if (typeof(code) != 'string') {
      res.code = '1001';
      res.msg.push('code:string');
    }
  }

  if (step_Uid === undefined) {
    res.code = '1000';
    res.msg.push('step_Uid:string')
  } else {
    if (typeof(step_Uid) != 'string') {
      res.code = '1001';
      res.msg.push('step_Uid:string');
    }
  }

  if (files === undefined) {
    res.code = '1000';
    res.msg.push('files:array');
  } else {
    if (!(files instanceof Array)) {
      res.code = '1001';
      res.msg.push('files:array');
    }
  }

  if (res.code === '1000') {
    res.msg = 'param ' + res.msg.join(' ') + ' is required';
  }

  if (res.code === '1001') {
    res.msg = 'param ' + res.msg.join(' ') + ' is wrong';
  }
  if (res.code === '0000') {
    res.data = {
      code,
      user_open_id: OPENID,
      step_Uid,
      files
    }
  }
  return res;
}
//检查用户权限
async function checkUserPermission(open_id) {
  const res = await cloud.callFunction({
    name: 'checkUserInfo',
    open_id
  });
  if (res.result.code !== '0000') {
    return {
      code: '2010',
      msg: res.result,
      data: null
    }
  }
  return res.result;
}
//上传附件
async function uploadAttachment(data) {
  const DB = cloud.database();
  const COLTION = DB.collection(data.code + '_event_attachments');
  let record = await checkRecord(data);

  const res = await writeAttachment(record, data);
  if (res && res._id) {
    return {
      code: '0000',
      msg: 'add attachment success',
      data: res
    }
  } else {
    return res;
  }
  //写入附件数据
  async function writeAttachment(record, data) {
    if (record && record._id) {
      return await addAttachment(record._id, data);
    } else {
      const attachements = await creatAttachment(data);
      return await creatEmployeeStep(data.code, data.step_Uid, attachements._id, data.user_open_id);
    }

    //添加一条附件数据
    async function creatAttachment(data) {
      try {
        const res = await COLTION.add({
          data: {
            user_open_id: data.user_open_id,
            step_Uid: data.step_Uid,
            files: data.files
          }
        })
        if (res._id) {
          return res;
        }
        return false;
      } catch (e) {
        console.log(e);
      }
    }
    //更新附件数据
    async function addAttachment(_id, data) {
      try {
        const _ = DB.command;
        const res = await COLTION.doc(_id).update({
          data: {
            files: _.push(data.files)
          }
        });

        if (res.stats.updated > 0) {
          const files = await COLTION.where({
            _id: _.in([_id])
          }).get()
          return {
            code: '0000',
            msg: '',
            data: {
              attachments: files.data[0].files,
              attachments_Uid: _id,
              status_code: 0,
              step_Uid: data.step_Uid,
              user_open_id: data.user_open_id
            }
          }
        }
        return false;
      } catch (e) {
        console.log(e);
      }
    }
  }
  //创建一条用户操作记录
  async function creatEmployeeStep(code, step_Uid, attachments_Uid, user_open_id, status_code = 0) {
    const res = await cloud.callFunction({
      name: "employeeAddStep",
      data: {
        code,
        step_Uid,
        status_code,
        attachments_Uid,
        user_open_id
      }
    });
    if (res.result.code === '0000') {
      return res.result
    }
  }
  //检查用户当前步骤是否存在
  async function checkRecord(data) {
    const res = await DB.collection(data.code + '_event_attachments').where({
      user_open_id: data.user_open_id,
      step_Uid: data.step_Uid
    }).get();
    if (res.data.length > 0) {
      return res.data[0];
    } else {
      return null;
    }
  }
};
// 云函数入口函数
/**
 * code:string 事件code
 * step_Uid:string 该事件下的步骤Uid
 * files:Array
 * 
 */
exports.main = async(event, context) => {
  const params = checkParams(event);
  if (params.code != '0000') {
    return params;
  }
  const userPermission = await checkUserPermission(params.data.user_open_id);
  if (userPermission.code != '0000') {
    return userPermission;
  }
  return await uploadAttachment(params.data);
}