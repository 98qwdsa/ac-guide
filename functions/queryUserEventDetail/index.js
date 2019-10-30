// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
const DB = cloud.database();
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

  if (res.code === '1000') {
    res.msg = 'param ' + res.msg.join(',') + ' required';
  }

  if (res.code === '1001') {
    res.msg = 'param ' + res.msg.join(',') + ' wrong';
  }

  if (res.code === '0000') {
    res.msg = 'param format ok';
    res.data = {
      open_id,
      code
    }
  }
  return res;
}

// 获取用户步骤
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
//获取事件步骤
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
//获取附件
async function getAttachment(code, _id = []) {
  const _ = DB.command;
  if (!_id.length) {
    return [];
  }
  const res = await DB.collection(code + '_event_attachments').where({
    _id: _.in(_id)
  }).get()
  return res.data[0].files;
}

//获取事件详情
async function getEventDetail(code) {
  try {
    const res = await DB.collection('event_list').where({
      code
    }).get();
    if (res.data.length < 1) {
      return {
        code: '2003',
        msg: 'there is no ' + code + '_event',
        data: null
      }
    }
    return {
      code: '0000',
      msg: '',
      data: {
        name: res.data[0].name,
        desc: res.data[0].desc,
        icon: res.data[0].icon
      }
    }
  } catch (e) {
    return {
      code: '3003',
      msg: e,
      data: null
    }
  }
}

async function mergeSteps(eventSteps, userSteps, eventDetail) {
  // 按事件的步骤信息获取当步骤是否体验用户参与，然后根据用户步骤查询附件
  let steps = [];
  for (i of eventSteps) {
    let user_step = null
    if (userSteps.length && userSteps[0].steps) {
      user_step = userSteps[0].steps.filter((e, key) => {
        return i._id === e.step_Uid;
      })[0]
    }
    steps.push({
      ...i,
      user_step: {
        ...user_step
      }
    })
  }
  return {
    code: '0000',
    msg: '',
    data: {
      detail: eventDetail,
      steps
    }
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
  // 获取事件信息
  const eventDetail = await getEventDetail(param.data.code);
  if (eventDetail.code !== '0000') {
    return eventDetail;
  }

  return await mergeSteps(steps.data, userSteps.data, eventDetail.data);
}