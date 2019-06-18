// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

function checkParams(data) {
  let {
    OPENID
  } = cloud.getWXContext();
  let {
    code,
    step_Uid,
    verified,
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

  if (step_Uid === undefined) {
    res.code = '1000';
    res.msg.push('step_Uid:string')
  } else {
    if (typeof(step_Uid) != 'string') {
      res.code = '1001';
      res.msg.push('step_Uid:string');
    }
  }
  if (verified === undefined) {
    verified = 0
  } else {
    if (typeof(verified) != 'number') {
      res.code = '1001';
      res.msg.push('verified:number');
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
      user_open_id: OPENID,
      step_Uid,
      step: {
        step_Uid,
        verified,
        attachments_Uid
      }
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
  const step = await checkStep(data.user_open_id);

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
    data.step.verified = await checkVerify(data.code, step._id);
    if (step && step._id) {
      return await editStep(step, data.step);
    } else {
      return await addStep(data);;
    }
    //添加步骤
    async function addStep(data) {
      try {
        const res = await COLTION.add({
          data: {
            user_open_id: data.user_open_id,
            step: data.step
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
    //编辑改步骤
    async function editStep(data, step) {
      const res = await COLTION.doc(data._id).update({
        data: {
          step
        }
      });

      if (res.stats.updated != undefined) {
        return data
      }
    }
    // 检查是否需要人工验证通过
    async function checkVerify(code, _id) {
      try {
        const res = DB.collection(code + '_event_steps').doc(_id).get();
        if (res.data && res.data.verifiers && res.data.verifiers.length > 0) {
          return 50;
        }
        return 100
      } catch (e) {

      }
    }
  }

  async function checkStep(user_open_id) {
    const res = await COLTION.where({
      user_open_id
    }).get();

    if (res.data.length > 0) {
      return res.data[0]
    }
    return false;
  }
}

/**
 * code:string  事件code 
 * step_Uid,
 * verified,
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