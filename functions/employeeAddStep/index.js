// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'prod-ayp2z'
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

  return await writeStep(step.data, data)

  //添加一步到事件的用户表
  async function writeStep(userStep, data) {
    data.status_code = await checkVerify(data, data.step_Uid);
    if (userStep.action === 'new') {
      return await newStep(data);
    } else if (userStep.action === 'add') {
      return await addStep(data, userStep);
    } else if (userStep.action === 'edit') {
      return await editStep(data, userStep);
    }
    //新建步骤
    async function newStep(data) {
      try {
        let status = 50;
        if(data.lastStep){
          const checklastStep = await checkLastStep(data.step_Uid,data.code)
          if(checklastStep.code !== '0000'){
            return checklastStep
          }
          if(checklastStep.data && data.status_code == 100){
            status = 100;
          }
        }
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
              date: DB.serverDate()
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
        if (status === 100) {
          const res = await updateUserCollection(data.code, user_id, status)
          if (res.code !== '0000') {
            return res;
          }
        }
        const res = await COLTION.doc(userStep.data._id).update({
          data: {
            status,
            steps: _.push({
              step_Uid: data.step_Uid,
              status_code: data.status_code,
              date: DB.serverDate()
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
        if (status === 100) {
          const res = await updateUserCollection(data.code, user_id, status)
          if (res.code !== '0000') {
            return res;
          }
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
          return {
            code: '3001',
            msg: e,
            data: null
          }
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