// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
// 检查参数
function checkParams(data) {
  let {
    OPENID
  } = cloud.getWXContext()
  let {
    code,
    step_Uid,
    file_url
  } = data;
  const res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (code === undefined) {
    res.code = '1000';
    res.msg.push('code:string')
  } else {
    if (typeof(code) === 'string') {
      res.code = '1001';
      res.msg.push('code:string');
    }
  }

  if (step_Uid === undefined) {
    res.code = '1000';
    res.msg.push('step_Uid:string')
  } else {
    if (typeof(step_Uid) === 'string') {
      res.code = '1001';
      res.msg.push('step_Uid:string');
    }
  }

  if (file_url === undefined) {
    res.code = '1000';
    res.msg.push('file_url:array')
  } else {
    res.code = '1001';
    res.msg.push('file_url:string');
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
      file_url
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
  return res.result;
}
//上传附件
async function uploadAttachment(data) {
  const DB = cloud.database();
  const COLTION = DB.collection(data.code + '_event_attachments');
  let record_id = await checkRecord(data);

  const res = await writeAttachment(record_id._id, data);
  if (res && res._id) {
    return {
      code: '0000',
      msg: 'add attachment success',
      data: res
    }
  }
  //写入附件数据
  async function writeAttachment(record_id, data) {
    if (record_id) {
      return await addAttachment(record_id, data.file_url);
    } else {
      return await creatAttachment(data);
    }

    //添加一条附件数据
    async function creatAttachment(data) {
      try {
        const res = await COLTION.add({
          data: {
            user_open_id: data.user_open_id,
            step_Uid: data.step_Uid,
            file_url: data.file_url
          }
        })
        if (res._id) {
          return res;
        }
        return false;
      } catch (e) {

      }
    }
    //更新附件数据
    async function addAttachment(_id, file_url) {
      try {
        const _ = DB.command;
        const res = await COLTION.doc(_id).updata({
          data: {
            file_url: _.push(file_url)
          }
        });

        if (res.stats.updated > 0) {
          return _id;
        }
        return false;
      } catch (e) {

      }
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


  async function addSteps() {

  }
};
// 云函数入口函数
/**
 * code:string 事件code
 * step_Uid:string 该事件下的步骤Uid
 * file_url:Array<file_ID>
 * 
 */
exports.main = async(event, context) => {
  const params = checkParams(data);
  if (params.code != '0000') {
    return params;
  }
  const userPermission = await checkUserPermission(params.data.user_open_id);
  if (userPermission.code != '0000') {
    return userPermission;
  }
  return await uploadAttachment(params.data);
}