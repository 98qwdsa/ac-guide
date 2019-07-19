// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

function checkParams(data) {
  let {
    code,
    user_open_id,
    step_Uid,
    status_code,
    attachments_Uid
  } = data;
  let res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (code === undefined) {
    res.code = '1000';
    res.msg.push('code:string')
  } else {
    if (typeof(code) != 'string') {
      res.code = '1001';
      res.msg.push('code:string');
    }
  }

  if (user_open_id === undefined) {
    user_open_id = cloud.getWXContext().OPENID
  } else {
    if (typeof(user_open_id) != 'string') {
      res.code = '1001';
      res.msg.push('user_open_id:string');
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
  if (status_code === undefined) {
    status_code = 0
  } else {
    if (typeof(status_code) != 'number') {
      res.code = '1001';
      res.msg.push('status_code:number');
    }
  }

  if (attachments_Uid === undefined) {
    attachments_Uid = ''
  } else {
    if (typeof(attachments_Uid) != 'string') {
      res.code = '1001';
      res.msg.push('attachments_Uid:string');
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
      user_open_id,
      step_Uid,
      status_code,
      attachments_Uid
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

//记录当前步骤
async function recordStep(data) {
  const DB = cloud.database();
  const COLTION = DB.collection(data.code + '_event_user');
  const step = await checkStep(data);

  const res = await writeStep(step, data)

  if (res && res._id) {
    return {
      code: '0000',
      msg: 'success',
      data: res
    }
  }
  //添加一步到事件的用户表
  async function writeStep(step, data) {
    data.status_code = await checkVerify(data, step.step_Uid);
    if (step && step._id) {
      return await editStep(step, data);
    } else {
      return await addStep(data);;
    }
    //添加步骤
    async function addStep(data) {
      try {
        const res = await COLTION.add({
          data: {
            user_open_id: data.user_open_id,
            step: data.step,
            step_Uid: data.step_Uid,
            status_code: data.status_code,
            attachments_Uid: data.attachments_Uid
          }
        })

        if (res._id) {
          let record = await COLTION.doc(res._id).get();
          const attachments = await getAttachment(data.code, [record.data.attachments_Uid]);
          record.data = {
            ...record.data,
            attachments,
            currentStep: true
          };
          return record.data;
        }
        return false;
      } catch (e) {
        console.log(e);
      }
    }
    //编辑改步骤
    async function editStep(step, data) {
      try {
        const res = await COLTION.doc(step._id).update({
          data: {
            status_code: data.status_code
          }
        });

        if (res.stats.updated != undefined) {
          return {
            ...step,
            status_code: data.status_code
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    // 检查是否需要人工验证通过
    async function checkVerify(data, _id) {
      if (data.status_code === 50) {
        try {
          const res = DB.collection(data.code + '_event_steps').doc(_id).get();
          if (res.data && res.data.verifiers && res.data.verifiers.length > 0) {
            return 50;
          } 
          return 100
        } catch (e) {
          console.log(e);
        }
      } else {
        return 0;
      }
    }
  }
  //获取附件
  async function getAttachment(code, _id = []) {
    const DB = cloud.database();
    const _ = DB.command;
    if (!_id.length) {
      return [];
    }
    const res = await DB.collection(code + '_event_attachments').where({
      _id: _.in(_id)
    }).get()
    if (res.data.length) {
      return res.data[0].files;
    }
    return undefined;
  }

  async function checkStep(data) {
    const res = await COLTION.where({
      user_open_id: data.user_open_id,
      step_Uid: data.step_Uid
    }).get();

    if (res.data.length > 0) {
      return res.data[0]
    }
    return false;
  }
}

/**
 * code:string  事件code 
 * status_code,
 * step_Uid,
 * attachments_Uid
 */
// 云函数入口函数
exports.main = async(event, context) => {
  const params = checkParams(event);
  if (params.code !== '0000') {
    return params;
  }

  const userPermission = await checkUserPermission(params.data.user_open_id);
  if (userPermission.code != '0000') {
    return userPermission;
  }

  return await recordStep(params.data);
}