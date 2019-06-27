// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const DB = cloud.database();
const COLION = DB.collection('event_list');
//检查参数格式
function checkParamFormat(data) {
  let {
    code,
    name,
    desc,
    icon,
    disabled,
    verifiers,
    role
  } = data;
  const res = {
    code: '0000',
    msg: [],
    data: {
      code,
      name,
      desc,
      icon,
      disabled,
      verifiers,
      role
    }
  }
  if (code === undefined) {
    res.code = '1000';
    res.msg.push('code:string')
  } else {
    if (typeof(code) != 'string' || code === '') {
      res.code = '1001';
      res.msg.push('code:string')
    }
  }
  if (name === undefined) {
    res.code = '1000';
    res.msg.push('name:string')
  } else {
    if (typeof(name) != 'string' || name === '') {
      res.name = '1001';
      res.msg.push('name:string')
    }
  }
  if (desc === undefined) {
    res.code = '1000';
    res.msg.push('desc:string')
  } else {
    if (typeof(desc) != 'string' || desc === '') {
      res.code = '1001';
      res.msg.push('desc:string')
    }
  }
  if (disabled === undefined) {
    disabled = false;
  } else {
    if (typeof(disabled) !== 'boolean') {
      res.code = '1001';
      res.msg.push('disabled:string')
    }
  }
  if (verifiers === undefined) {
    verifiers = [];
  } else {

    if (typeof(verifiers) !== 'array') {
      res.code = '1001';
      res.msg.push('verifiers:string')
    }
  }
  if (role === undefined) {
    role = ['employee'];
  } else {
    if (typeof(role) !== 'array') {
      res.code = '1001';
      res.msg.push('role:string')
    }
  }
  if (res.code === '1000') {
    res.msg = 'param ' + res.msg.join(',') + ' is required';
  }
  if (res.code === '1001') {
    res.msg = 'param ' + res.msg.join(',') + ' wrong';
  }
  if (res.code === '0000') {
    res.msg = 'param format ok';
  }
  return res;
}
//检查用户是否有admin权限
async function checkPermision() {
  //角色验证
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo',
    })
    if (curUserInfo.result.data.power.indexOf('admin') > -1) {
      return {
        code: '2000',
        msg: 'permission denied',
        data: null
      }
    }

    return {
      code: '0000',
      msg: '',
      data: null
    }
  } catch (e) {
    return {
      code: '3000',
      msg: e,
      data: null
    }
  }
}
// 检查事件是否已存在
async function checkEvent(code) {
  try {
    const res = await COLION.where({
      code
    }).get();

    if (res.data.length > 0) {
      return {
        code: '2001',
        msg: 'event ' + code + ' already exists.',
        data: res.data
      }
    }
    return {
      code: '0000',
      msg: '',
      data: null
    }
  } catch (e) {
    return {
      code: '3001',
      msg: e,
      data: null
    }
  }
}
//添加事件
async function addCustomEventToEventList(data) {
  const {
    code = '',
      name = '',
      desc = '',
      icon = '',
      disabled = false,
      verifiers = [],
      role = ['employee']
  } = data;
  try {
    const res = await COLION.add({
      data: {
        code,
        name,
        desc,
        icon,
        disabled,
        verifiers,
        role
      }
    })
    if (res._id) {
      return {
        code: '0000',
        msg: res.errMsg,
        data: res
      };
    } else {
      return {
        code: '2002',
        msg: res.errMsg,
        data: res
      };
    }

  } catch (e) {
    return {
      code: '3002',
      msg: '',
      data: e
    };
  }
}
//添加事件关联表
async function createCustomEventCollection(code) {
  const result = {
    code: '0000',
    msg: '',
    data: []
  }

  if (!code || typeof(code) != 'string') {
    return {
      code: '2003',
      msg: 'param code:string required',
      data: []
    }
  }
  try {
    const steps = await DB.createCollection(code + '_event_steps');
    if (steps.errMsg != "createCollection:ok") {
      result.code = '2004';
      result.msg += 'create ' + code + '_event_steps fail, ';
    }
  } catch (e) {
    result.code = '3003';
    result.data.push(e);
    result.msg += 'create ' + code + '_event_steps fail, ';
  }
  try {
    const user = await DB.createCollection(code + '_event_user');
    if (user.errMsg != "createCollection:ok") {
      result.code = '2004';
      result.msg += 'create ' + code + '_event_user fail, ';
    }
  } catch (e) {
    result.code = '3003';
    result.data.push(e);
    result.msg += 'create ' + code + '_event_user fail, ';
  }

  try {
    const attachments = await DB.createCollection(code + '_event_attachments');
    if (attachments.errMsg != "createCollection:ok") {
      result.code = '2004';
      result.msg += 'create ' + code + '_event_attachments fail, ';
    }
  } catch (e) {
    result.code = '3003';
    result.data.push(e);
    result.msg += 'create ' + code + '_event_attachments fail, ';
  }

  try {
    const observers = await DB.createCollection(code + '_event_observeds');
    if (observers.errMsg != "createCollection:ok") {
      result.code = '2004';
      result.data.push(e);
      result.msg += 'create ' + code + '_event_observeds fail, '
    }
  } catch (e) {
    result.code = '3003';
    result.data.push(e);
    result.msg += 'create ' + code + '_event_observeds fail, '
  }
  return result;
}
/**
 * {
 *  code = '',
 *  name = '',
 *  desc = '',
 *  icon = '',
 *  disabled = false,
 *  verifiers = [],
 *  role = ['employee']
 * }
 */

// 云函数入口函数
exports.main = async(event, context) => {
  const checkParam = checkParamFormat(event);
  if (checkParam.code !== '0000') {
    return checkParam;
  }

  const bEvent = await checkEvent(event.code);
  if (bEvent.code !== '0000') {
    return bEvent;
  }

  const permission = await checkPermision();
  if (permission.code !== '0000') {
    return permission;
  }
  const customEvent = await addCustomEventToEventList(event);
  if (customEvent.code !== '0000' || !customEvent.data._id) {
    return customEvent;
  }

  const customEventCollections = await createCustomEventCollection(event.code);
  if (customEventCollections.code !== '0000') {
    return customEventCollections
  }
  return {
    code: '0000',
    msg: 'add ' + event.code + ' event success',
    data: {
      event_id: customEvent.data._id
    }
  }
}