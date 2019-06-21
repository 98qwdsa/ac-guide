// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
// 检查参数格式
function checkParamFormat(data) {
  const wxContext = cloud.getWXContext();
  let {
    code,
    open_id
  } = data;
  const res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (code === undefined) {
    res.code = '1001';
    res.msg.push('code:string');
  } else {
    if (typeof(code) != 'string' || code === '') {
      res.code = '1001';
      res.msg.push('code:string');
    }
  }

  if (open_id === undefined) {
    open_id = wxContext.OPENID
  } else {
    if (typeof(code) != 'string' || code === '') {
      res.code = '1001';
      res.msg.push('code:string');
    }
  }

  return {
    code: '0000',
    msg: '',
    data: {
      open_id,
      code
    }
  }
}

async function getUserStep(data) {
  try {
    const res = await cloud.database().collection(data.code + '_event_user').where({
      user_open_id: data.open_id
    }).get();
    // if (res.data.length < 1) {
    //   return {
    //     code: '2001',
    //     msg: 'this is no steps for this user',
    //     data: null
    //   }
    // }
    return {
      code: '0000',
      msg: res.errMsg,
      data: res.data
    }
  } catch (e) {
    return {
      code: '3001',
      msg: e,
      data: null
    }
  }
}

async function getSteps(code) {
  const COLION = cloud.database().collection(code + '_event_steps');
  try {
    const res = await COLION.get();
    if (res.data.length < 1) {
      return {
        code: '2002',
        msg: 'there is no steps',
        data: null
      }
    }
    //排序
    res.data.sort((a, b) => a.order - b.order);
    return {
      code: '0000',
      msg: res.errMsg,
      data: res.data
    }
  } catch (e) {
    return {
      code: '3002',
      msg: e,
      data: null
    }
  }
}

async function getAttachment(code, _id = []) {
  const DB = cloud.database();
  const _ = DB.command;
  if (!_id.length) {
    return [];
  }
  const res = await DB.collection(code + '_event_attachments').where({
    _id: _.in(_id)
  }).get()
  return res.data[0].files;
}

async function mergeSteps(steps, userSteps, code) {
  // 按事件的步骤信息获取当步骤是否体验用户参与，然后根据用户步骤查询附件
  let NuserSteps = [];
  for (i of steps) {
    let user_step = {}
    if (userSteps) {
      const curUserStep = userSteps.filter((e, key) => {
        return i._id === e.step_Uid;
      })[0];
      let attachments = [];
      let currentStep = undefined;
      if (curUserStep) {
        if (curUserStep.attachments_Uid) {
          attachments = await getAttachment(code, [curUserStep.attachments_Uid]);
        }
        if (curUserStep.status_code) {
          currentStep = curUserStep.status_code === 100 ? true : undefined
        }
      }
      user_step = {
        ...curUserStep,
        attachments,
        currentStep,
      }


      NuserSteps.push({
        ...i,
        user_step
      })
    } else {
      NuserSteps.push({
        ...i,
        user_step: null
      })
    }
  }
  return {
    code: '0000',
    msg: '',
    data: NuserSteps
  }
}

// 云函数入口函数
// 入口参数
/**
 *  {
 *    code:'',// 事件code
 *    open_id:'', //用户open_id  默认为当前访问用的open_id
 *  }
 **/
exports.main = async(event, context) => {
  const param = checkParamFormat(event);
  if (param.code !== '0000') {
    return param;
  }

  //事件的步骤信息
  const steps = await getSteps(param.data.code);
  if (steps.code !== '0000') {
    return steps;
  }
  // 用户的步骤信息
  const userSteps = await getUserStep(param.data);
  if (userSteps.code !== '0000') {
    return userSteps;
  }

  return await mergeSteps(steps.data, userSteps.data, param.data.code);
}