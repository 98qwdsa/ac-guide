// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'demo-5c0mj'
});

function checkParams(data) {
  let {
    code,
    user_open_id,
    step_Uid,
    status_code,
    // attachments_Uid
    lastStep = false,
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

  // if (attachments_Uid === undefined) {
  //   attachments_Uid = ''
  // } else {
  //   if (typeof(attachments_Uid) != 'string') {
  //     res.code = '1001';
  //     res.msg.push('attachments_Uid:string');
  //   }
  // }

  if (typeof(lastStep) != 'boolean') {
    res.code = '1001';
    res.msg.push('lastStep:boolean');
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
      lastStep
      // attachments_Uid
    }
  }
  return res;
}

//检查用户权限
async function checkUserPermission(open_id) {
  const res = await cloud.callFunction({
    name: 'checkUserInfo',
    data: {
      open_id
    }
  });
  if (res.result.code !== '0000') {
    return {
      code: '2001',
      msg: res.result,
      data: null
    }
  }
  return res.result;
}

//记录当前步骤
async function recordStep(data, user_id) {
  const DB = cloud.database();
  const COLTION = DB.collection(data.code + '_event_user');
  const step = await checkStep(data);
  if (step.code != '0000') {
    return step;
  }
  const writeStepRes = await writeStep(step.data, data);
  if (writeStepRes.code != '0000') {
    return writeStepRes;
  }

  if (data.status_code !== 100) {
    const stepDetail = await getStepDetail(data.step_Uid);
    await addConfirmRecord(data.code, stepDetail.data.verifiers, stepDetail.data._id, user_id)
  }
  return writeStepRes;

  //添加一步到事件的用户表
  async function writeStep(userStep, data) {
    //当前用户在该事件下的状态
    let status = 50;
    if (data.lastStep) {
      const checklastStep = await checkLastStep(data.step_Uid, data.code)
      if (checklastStep.code !== '0000') {
        return checklastStep
      }
      if (checklastStep.data && data.status_code == 100) {
        status = 100;
      }
    }
    //当前步骤状态
    data.status_code = await checkVerify(data, data.step_Uid);
    if (userStep.action === 'new') {
      return await newStep(data);
    } else if (userStep.action === 'add') {
      return await addStep(data, userStep);
    } else if (userStep.action === 'edit') {
      return await editStep(data, userStep);
    }

    //当前用户在该事件下的状态
    //新建步骤
    async function newStep(data) {
      try {
        const updateUser = await updateUserCollection(data.code, user_id, status)
        if (updateUser.code !== '0000') {
          return res;
        }

        const res = await COLTION.add({
          data: {
            user_open_id: data.user_open_id,
            status,
            steps: [{
              step_Uid: data.step_Uid,
              status_code: data.status_code,
              date: new Date().toString()
            }]
          }
        })

        if (res._id) {
          return {
            code: '0000',
            msg: '',
            data: {
              step_Uid: data.step_Uid,
              status_code: data.status_code,
              date: data.date,
              status: data.status
            }
          }
        } else {
          return {
            code: '2003',
            msg: '',
            data: null
          }
        }
      } catch (e) {
        return {
          code: '3005',
          msg: e,
          data: null
        }
      }
    }

    async function addStep(data, userStep) {
      const _ = DB.command
      try {
        const updateUser = await updateUserCollection(data.code, user_id, status)
        if (updateUser.code !== '0000') {
          return res;
        }

        const res = await COLTION.doc(userStep.data._id).update({
          data: {
            status,
            steps: _.push({
              step_Uid: data.step_Uid,
              status_code: data.status_code,
              date: new Date().toString()
            })
          }
        })

        if (res.stats.updated) {
          return {
            code: '0000',
            msg: '',
            data: {
              step_Uid: data.step_Uid,
              status_code: data.status_code,
              date: data.date
            }
          }
        }
        return {
          code: '2003',
          msg: '',
          data: null
        }
      } catch (e) {
        return {
          code: '3006',
          msg: e,
          data: null
        }
      }
    }
    //编辑改步骤
    async function editStep(data, userStep) {
      try {

        const res = await updateUserCollection(data.code, user_id, status)
        if (res.code !== '0000') {
          return res;
        }

        steps = userStep.data.steps.map(e => {
          let item = { ...e
          }
          if (e.step_Uid === data.step_Uid) {
            item = {
              ...item,
              status_code: data.status_code,
            }
          }
          return item
        })
        const res = await COLTION.doc(userStep.data._id).update({
          data: {
            status,
            steps
          }
        });

        if (res.stats.updated) {
          return {
            code: '0000',
            msg: '',
            data: {
              step_Uid: data.step_Uid,
              status_code: data.status_code,
              date: data.date
            }
          }
        } else {
          return {
            code: '2004',
            msg: '',
            data: null
          }
        }
      } catch (e) {
        return {
          code: '3006',
          msg: e,
          data: null
        }
      }
    }
    // 检查是否需要人工验证通过
    async function checkVerify(data, _id) {
      if (data.status_code === 50) {
        try {
          const res = await getStepDetail(_id);
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
  async function getStepDetail(_id) {
    return await DB.collection(data.code + '_event_steps').doc(_id).get();
  }
  //获取附件
  // async function getAttachment(code, _id = []) {
  //   const DB = cloud.database();
  //   const _ = DB.command;
  //   if (!_id.length) {
  //     return [];
  //   }
  //   const res = await DB.collection(code + '_event_attachments').where({
  //     _id: _.in(_id)
  //   }).get()
  //   if (res.data.length) {
  //     return res.data[0].files;
  //   }
  //   return undefined;
  // }

  async function checkStep(data) {
    try {
      const res = await COLTION.where({
        user_open_id: data.user_open_id
      }).get();

      let msg = {
        action: 'new',
        data: null
      };

      if (res.data.length) {
        try {
          res.data[0].steps.forEach(e => {
            if (e.step_Uid === data.step_Uid) {
              msg = {
                action: 'edit',
                data: res.data[0]
              }
              throw new Error();
            } else {
              msg = {
                action: 'add',
                data: res.data[0]
              }
            }
          })
        } catch (e) {

        }
      }
      return {
        code: '0000',
        msg: '',
        data: msg
      }
    } catch (e) {
      return {
        code: '3002',
        msg: e,
        data: null
      }
    }
  }
  //判断该事件步骤是否为最后一步
  async function checkLastStep(_id, code) {
    try {
      let data = false;
      const res = await DB.collection(`${code}_event_steps`).get();
      if ([...res.data].pop()._id === _id) {
        data = true
      }
      return {
        code: '0000',
        data,
        msg: ''
      }
    } catch (e) {
      return {
        code: '3003',
        data: null,
        msg: e
      }
    }
  }

  async function updateUserCollection(code, _id, status = 50) {
    const DB = cloud.database();
    const _ = DB.command
    let data = {
      attends: _.push([code])
    }
    if (status === 100) {
      data = {
        attends: _.pull(code),
        completed: _.push([code])
      }
    }
    try {
      const res = await DB.collection('user').doc(_id).update({
        data
      });
      if (res.stats.updated) {
        return {
          code: '0000',
          msg: 'success',
          data: null
        }
      } else {
        return {
          code: '2002',
          msg: '',
          data: null
        }
      }
    } catch (e) {
      return {
        code: '3004',
        msg: e,
        data: null
      }
    }
  }

  async function addConfirmRecord(event_code, observer_open_id, step_uid, participant_uid) {
    let result = null;
    const COLTION = DB.collection(data.code + '_event_step_confirm');
    for (let i in observer_open_id) {
      let b = await checkObserverOpenId(observer_open_id[i]);
      if (b.code !== '0000') {
        return b;
      }
      if (b.data) {
        //更新逻辑
        await updateVerifierRecord(observer_open_id[i], step_uid, participant_uid)
      } else {
        // 往表里插入一条新记录
        await addVerifierRecord(observer_open_id[i], step_uid, participant_uid);
      }
    }

    async function addVerifierRecord(observer_open_id, step_uid, participant_uid) {
      try {
        const res = await COLTION.add({
          data: {
            observer_open_id,
            steps: [{
              step_uid,
              participant_uid
            }]
          }
        })
        if (res._id) {
          return {
            code: '0000',
            msg: '',
            data: {
              observer_open_id,
              steps: [{
                step_uid,
                participant_uid
              }]
            }
          }
        } else {
          return {
            code: '2005',
            msg: '',
            data: null
          }
        }
      } catch (e) {
        return {
          code: '3007',
          msg: e,
          data: null
        }
      }
    }

    async function updateVerifierRecord(observer_open_id, step_uid, participant_uid) {
      try {
        const res = await COLTION.where({
          observer_open_id
        }).update({
          data: {
            steps: _.push({
              step_uid,
              participant_uid
            })
          }
        })
        if (res.stats.updated) {
          return {
            code: '0000',
            msg: '',
            data: {
              step_uid,
              participant_uid
            }
          }
        }
        return {
          code: '2006',
          msg: '',
          data: null
        }
      } catch (e) {
        return {
          code: '3007',
          msg: e,
          data: null
        }
      }

    }

    async function checkObserverOpenId(observer_open_id) {
      try {
        let b = false;
        //查询observer_open_id是否存在
        const result = await COLTION.where({
          observer_open_id
        }).get()
        if (result.data.length) {
          b = true;
        }
        return {
          code: '0000',
          msg: '',
          data: b
        }
      } catch (e) {
        return {
          code: '3001',
          msg: e,
          data: null
        }
      }
    }
  }
}

/**
 * code:string  事件code 
 * status_code,
 * step_Uid,
 * lastStep:boolean
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

  return await recordStep(params.data, userPermission.data._id);
}