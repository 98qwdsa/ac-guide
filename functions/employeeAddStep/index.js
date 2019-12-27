// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'demo-5c0mj'
});

function checkParams(data) {
  let {
    code,
    user_open_id = cloud.getWXContext().OPENID,
    participant_uid = '',
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

  if (typeof(user_open_id) != 'string') {
    res.code = '1001';
    res.msg.push('user_open_id:string');
  }

  if (typeof(participant_uid) != 'string') {
    res.code = '1001';
    res.msg.push('participant_uid:string');
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
      participant_uid,
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
  //如果该步骤不需要确认直接返回确认结果
  if (data.status_code === 100) {
    return writeStepRes;
  } else {
    //如果该步骤需要确认
    //获取该步骤确认者和该步骤表ID
    const stepDetail = await getStepDetail(data.code, data.step_Uid);
    //添加待确认步骤到对应步骤确认者
    const addConfirmRecordres = await addConfirmRecord(data.code, stepDetail.data.verifiers, stepDetail.data._id, user_id)
    if (addConfirmRecordres.code !== '0000') {
      return addConfirmRecordres;
    }
    return writeStepRes;
  }

  //该事件是否有完成事件后的模板
  async function hasEventCompleteTemplate(code) {
    const DB = cloud.database();
    try {
      const res = await DB.collection(`event_list`).where({
        code
      }).get();
      if (res.data.length < 1) {
        return {
          code: '',
          msg: 'there is no ' + code + '_event',
          data: null
        }
      }
      return {
        code: '0000',
        msg: '',
        data: res.data[0].complete_tpl
      }
    } catch (e) {
      return {
        code: '3010',
        msg: e,
        data: null
      }
    }
  }


  //添加一步到事件的用户表
  async function writeStep(userStep, data) {
    //当前步骤状态
    data.status_code = await checkVerify(data, data.step_Uid);

    //当前用户在该事件下的状态
    let status = 50;
    if (data.lastStep) {
      const checklastStep = await checkLastStep(data.step_Uid, data.code)
      if (checklastStep.code === '0000') {
        data.lastStep = true;
      } else {
        data.lastStep = false;
        return checklastStep
      }

      if (checklastStep.data && data.status_code == 100) {
        let complete_tpl = await hasEventCompleteTemplate(data.code);
        if (complete_tpl.code !== '0000') {
          return complete_tpl;
        }
        status = 100;
        // 如果该事件需要在完成后弹出提示框
        if (complete_tpl.data) {
          status = 80
        }
      }
    }

    //根据当前参与者在该事件下的状态，修改该用户的参与事件或者已完成事件字段
    const updateUser = await updateUserCollection(data.code, user_id, status)
    if (updateUser.code !== '0000') {
      return res;
    }
    if (userStep.action === 'new') {
      return await newStep(data);
    } else if (userStep.action === 'add') {
      return await addStep(data, userStep);
    } else if (userStep.action === 'edit') {
      return await editStep(data, userStep);
    }


    //参与者第一次确认步骤，执行新建参加步骤记录
    async function newStep(data) {
      try {
        const date = new Date().getTime()
        const res = await COLTION.add({
          data: {
            user_open_id: data.user_open_id,
            status,
            steps: [{
              step_Uid: data.step_Uid,
              status_code: data.status_code,
              date
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
              date,
              status
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
    //参与者添加一条确认步骤
    async function addStep(data, userStep) {
      const _ = DB.command
      const date = new Date().getTime();
      try {
        const res = await COLTION.doc(userStep.data._id).update({
          data: {
            status,
            steps: _.push({
              step_Uid: data.step_Uid,
              status_code: data.status_code,
              date
            })
          }
        })

        if (res.stats.updated) {
          return {
            code: '0000',
            msg: '',
            data: {
              status,
              step_Uid: data.step_Uid,
              status_code: data.status_code,
              date
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
    //确认者确认当前步骤
    async function editStep(data, userStep) {
      try {
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
        //确认后修改参与者步骤以及当前事件的参与状态 // 
        let complete_tpl = await hasEventCompleteTemplate(data.code);
        if (complete_tpl.code !== '0000') {
          return complete_tpl;
        }
        const newData = {
          status: data.lastStep ? (complete_tpl.data ? 80 : 100) : status,
          steps
        }
        const updateStepsRes = await COLTION.doc(userStep.data._id).update({
          data: newData
        });

        if (!updateStepsRes.stats.updated) {
          return {
            code: '2004',
            msg: '',
            data: null
          }
        }
        if (data.status_code === 100) {
          //确认成功后
          const res = await updateEventStepComfirm(data.code, data.user_open_id, data.step_Uid, data.participant_uid)
          if (res.code === '0000') {
            return {
              code: '0000',
              msg: '',
              data: { ...newData.steps[0],
                status: newData.status
              }
            }
          } else {
            return res
          }
        }
      } catch (e) {
        return {
          code: '3007',
          msg: e,
          data: null
        }
      }

      // 更新当前确认者的确认记录。 待确认步骤移动到已确认步骤
      async function updateEventStepComfirm(code, observer_open_id, step_uid, participant_uid) {
        const COL = DB.collection(`${code}_event_step_confirm`);
        const _ = DB.command;
        const res = await COL.where({
          observer_open_id
        }).get();

        //确认后的步骤 从待确认字段移动到已确认字段
        const updateRes = await COL.doc(res.data[0]._id).update({
          data: {
            steps: _.pull({
              step_uid,
              participant_uid
            }),
            confirm_steps: _.push([{
              step_uid,
              participant_uid
            }])
          }
        })
        //删除当前确认者之外的确认者的当前待确认的步骤记录
        const removeRes = await removeOtherObserverStep(code, step_uid, participant_uid, observer_open_id);
        if (removeRes.code !== '0000') {
          return removeRes;
        }
        if (updateRes.stats.updated && removeRes.code === '0000') {
          return {
            code: '0000',
            data: null,
            msg: 'confirm success'
          };
        } else {
          return {
            code: '2008',
            data: null,
            msg: ''
          };
        }
      }

      //删除当前确认者之外的确认者的当前待确认的步骤记录
      async function removeOtherObserverStep(code, step_uid, participant_uid, observer_open_id) {
        let verifiers = [];
        try {
          const step = await DB.collection(`${code}_event_steps`).doc(step_uid).get();
          verifiers = step.data.verifiers.filter((item) => {
            return (item !== observer_open_id)
          });
        } catch (e) {
          return {
            code: '3008',
            msg: e,
            data: null
          }
        }
        try {
          for (let i = 0; i < verifiers.length; i++) {
            const COL = DB.collection(`${code}_event_step_confirm`);
            const _ = DB.command;
            const res = await COL.where({
              observer_open_id: verifiers[i]
            }).update({
              data: {
                steps: _.pull({
                  step_uid,
                  participant_uid
                })
              }
            })
            if (!res.stats.updated) {
              return {
                code: '2009',
                msg: 'update not success',
                data: null
              }
            }
          }
          return {
            code: '0000',
            msg: 'all updated success',
            data: null
          }
        } catch (e) {
          return {
            code: '3009',
            msg: e,
            data: null
          }
        }
      }
    }
    // 检查是否需要人工验证通过
    async function checkVerify(data, _id) {
      if (data.status_code === 50) {
        try {
          const res = await getStepDetail(data.code, _id);
          if (res.data && res.data.verifiers && res.data.verifiers.length > 0) {
            return 50;
          }
          return 100
        } catch (e) {
          console.log(e);
        }
      } else {
        return data.status_code;
      }
    }
  }
  // 获取步骤详情
  async function getStepDetail(code, _id) {
    return await DB.collection(code + '_event_steps').doc(_id).get();
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
  // 检查当前步骤是否已存在，以及该步骤详情
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
  //更新用户的参与事件与已完成事件字段
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
  //添加参与者确认后需要确认步骤记录
  async function addConfirmRecord(event_code, observer_open_id, step_uid, participant_uid) {
    const COLTION = DB.collection(data.code + '_event_step_confirm');
    for (let i in observer_open_id) {
      let b = await checkObserverOpenId(observer_open_id[i]);
      if (b.code !== '0000') {
        return b;
      }
      let actoinResult;
      if (b.data) {
        //更新逻辑
        actoinResult = await updateVerifierRecord(observer_open_id[i], step_uid, participant_uid)
      } else {
        // 往表里插入一条新记录
        actoinResult = await addVerifierRecord(observer_open_id[i], step_uid, participant_uid);
      }
      if (actoinResult.code !== '0000') {
        return actoinResult;
      }
    }
    return {
      code: '0000',
      msg: 'update or insert success',
      data: null
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
      const _ = DB.command
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
        if (result.data.length !== 0) {
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
 * participant_uid,
 * lastStep:boolean,
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