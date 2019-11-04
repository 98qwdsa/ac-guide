// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
const DB = cloud.database();
//检查参数
function checkParamFormat(data) {
  let {
    code,
    observer_open_id,
    observed_open_id,
    action
  } = data;
  const res = {
    code: '0000',
    msg: [],
    data: {
      code,
      observer_open_id,
      observed_open_id,
      action
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

  if (action === undefined) {
    action = 'manage'
  } else {
    if (action != 'cancel' && action != 'manage' && action != 'observe') {
      res.code = '1001';
      res.msg.push('action:string')
    }
  }
  if (observer_open_id === undefined) {
    res.code = '1000';
    res.msg.push('observer_open_id:' + action === 'manage' ? 'array' : 'string');
  } else {
    if (action === 'cancel' || action === 'observe') {
      if (typeof(observer_open_id) != 'string' || observer_open_id === '') {
        res.code = '1001';
        res.msg.push('observer_open_id:string')
      }
    }
    if (action === 'manage') {
      if (!(observer_open_id instanceof Array)) {
        res.code = '1001';
        res.msg.push('observer_open_id:arrray')
      }
    }
  }

  if (observed_open_id === undefined) {
    res.code = '1000';
    res.msg.push('observed_id:string')
  } else {
    if (typeof(observed_open_id) != 'string' || observed_open_id === '') {
      res.code = '1001';
      res.msg.push('observed_open_id:string')
    }
  }

  if (res.code === '1000') {
    res.msg = 'param ' + res.msg.join(',') + ' required';
  }

  if (res.code === '1001') {
    res.msg = 'param ' + res.msg.join(',') + ' wrong';
  }

  if (res.code === '0000') {
    res.msg = 'param format ok'
    res.data = {
      code,
      observer_open_id,
      observed_open_id,
      action
    }
  }
  return res;
}

//检查事件是否存在
async function checkEvent(code) {
  try {
    const res = await DB.collection('event_list').where({
      code
    }).get();

    if (res.data.length < 1) {
      return {
        code: '2001',
        msg: 'event ' + code + ' not exists.',
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

//检查操作者是否有权限
async function checkPermision(action) {
  //角色验证
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo',
    })
    if (action === 'cancel') {
      if (!curUserInfo.result.data.role.includes('PM') && !curUserInfo.result.data.role.includes('HR')) {
        return {
          code: '2002',
          msg: 'permission denied',
          data: null
        }
      }
    }
    if (action === 'edit') {
      if (!curUserInfo.result.data.role.includes('HR')) {
        return {
          code: '2003',
          msg: 'permission denied',
          data: null
        }
      }
    }

    return {
      code: '0000',
      msg: '',
      data: null
    }
  } catch (e) {
    return {
      code: '3002',
      msg: e,
      data: null
    }
  }
}
//检查observer_open_id是PM或者HR
async function checkObserverPermision(data) {
  const open_ids = data.action != 'manage' ? [data.observer_open_id] : data.observer_open_id
  for (let i of open_ids) {
    const res = await checkPermision(i);
    if (res.code != '0000') {
      return res;
    }
  }

  return {
    code: '0000',
    msg: '',
    data: null
  }
  //检查观察者是否为 观察者或者发布者
  async function checkPermision(open_id) {
    //角色验证
    try {
      const curUserInfo = await cloud.callFunction({
        name: 'checkUserInfo',
        data: {
          open_id
        }
      })
      if (curUserInfo.result.data && (curUserInfo.result.data.role.includes('PM') || curUserInfo.result.data.role.includes('HR'))) {
        return {
          code: '0000',
          msg: '',
          data: null
        }
      }

      return {
        code: '2004',
        msg: 'permission denied',
        data: null
      }


    } catch (e) {
      return {
        code: '3003',
        msg: e,
        data: null
      }
    }
  }

}

//编辑观察记录
async function editObserverRecord(data) {
  const observedRes = await checkObserved(data.code, data.observed_open_id);
  if (observedRes.data === null) {
    return await createObserverRecord(data)
  } else {
    return await updateObserverRecord(data, observedRes.data)
  }
}
//检查被观察者
async function checkObserved(code, open_id) {
  try {
    const res = await DB.collection(code + '_event_observeds').where({
      observed_open_id: open_id
    }).get();
    if (res.data.length > 0) {
      return {
        code: '0000',
        msg: '',
        data: res.data[0]
      }
    }
    return {
      code: '2005',
      msg: 'no record',
      data: null
    }
    console.log(res);
  } catch (e) {
    return {
      code: '3004',
      msg: e,
      data: null
    }
  }
}
//创建一条该事件的被观察者的记录
async function createObserverRecord(data) {
  if (data.action === 'cancel') {
    return {
      code: '2006',
      msg: 'no record to cancel',
      data: ''
    };
  }
  try {
    const newObserverOpenIds = data.action === 'observe' ? [data.observer_open_id] : data.observer_open_id;
    const res = await DB.collection(data.code + '_event_observeds').add({
      data: {
        observed_open_id: data.observed_open_id,
        observer_open_id: newObserverOpenIds
      }
    });
    if (!res._id) {
      return {
        code: '2007',
        msg: res.errMsg,
        data: ''
      };
    }
    return {
      code: '0000',
      msg: 'add record success',
      data: res._id
    }
  } catch (e) {
    return {
      code: '3005',
      msg: e,
      data: null
    }
  }

}
//更新该被观察者的记录
async function updateObserverRecord(data, observedRes) {
  let update = {};
  const _ = DB.command;
  if (data.action === 'manage') {
    const newObserverOpenIds = [...new Set([...observedRes.observer_open_id, ...data.observer_open_id])]; // 数组合并去重
    update = {
      data: {
        observer_open_id: newObserverOpenIds
      }
    }
  }
  if (data.action === 'observe') {
    if (observedRes.observer_open_id.includes(data.observer_open_id)) {
      return {
        code: '2009',
        msg: 'observer has observed',
        data: null
      }
    }
    update = {
      data: {
        observer_open_id: _.push(data.observer_open_id)
      }
    }
  }
  if (data.action === 'cancel') {
    if (!observedRes.observer_open_id.includes(data.observer_open_id)) {
      return {
        code: '2010',
        msg: 'observer doesn\'t observed',
        data: null
      }
    };
    const newObserverOpenIds = [...observedRes.observer_open_id];
    newObserverOpenIds.splice(newObserverOpenIds.indexOf(data.observer_open_id), 1)
    update = {
      data: {
        observer_open_id: newObserverOpenIds
      }
    }
  }
  try {
    const res = await DB.collection(data.code + '_event_observeds').doc(observedRes._id).update({
      ...update
    })
    if (res.stats.updated < 1) {
      return {
        msg: 'no record updated',
        code: '2011',
        data: res.stats
      };
    }
    return {
      msg: res.errMsg,
      code: '0000',
      data: res.stats
    };
  } catch (e) {
    return {
      code: '3006',
      msg: e,
      data: null
    }
  }
}
/**
 * {
 *  code = '',   // 事件code,
 *  action = 'edit',  //[manage|observe|cancel]  manage主要实现HR批量编辑关注者，  observe实现单个关注, cancel实现单个取消关注
 *  observer_open_id = ''|[], //观察者open_id
 *  observed_open_id = ''  // 被观察者open_id
 * }
 */
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  //检查参数
  const param = checkParamFormat(event);
  if (param.code !== '0000') {
    return param;
  }
  //检查事件是否存在
  const bEvent = await checkEvent(param.data.code);
  if (bEvent.code !== '0000') {
    return bEvent;
  }
  //检查操作者是否有权限
  const permission = await checkPermision(param.data.action);
  if (permission.code !== '0000') {
    return permission;
  }
  //检查observer_open_id是PM或者HR
  const observerPermission = await checkObserverPermision(param.data);
  if (observerPermission.code !== '0000') {
    return observerPermission;
  }
  //编辑观察记录
  return await editObserverRecord(param.data);
}