// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
const DB = cloud.database();
const COLION = DB.collection('event_list');
// 检查参数格式
function checkParamFormat(data) {
  const {
    code,
    disabled,
    action
  } = data;
  const res = {
    code: '0000',
    msg: [],
    data: {
      code,
      disabled,
      action
    }
  }
  if (code === undefined) {
    res.code = '1000'
    res.msg.push('code:string')
  } else {
    if (typeof(code) !== 'string') {
      res.code = '1001'
      res.msg.push('code:string')
    }

  }
  if (action != undefined && action !== 'delete') {
    res.code = '1001'
    res.msg.push('action:string')
  } else {
    if (disabled === undefined) {
      res.code = '1000'
      res.msg.push('disabled:boolean')
    } else {
      if (typeof(disabled) != 'boolean') {
        res.code = '1001'
        res.msg.push('disabled:boolean')
      }
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
    if (curUserInfo.result.data.power.indexOf['admin'] > -1) {
      return {
        code: '2000',
        msg: 'permission denied',
        data: null
      }
    }

    return {
      msg: '',
      code: '0000',
      data: null
    }
  } catch (e) {
    return {
      msg: e,
      code: '3000',
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
    if (res.data.length === 1) {
      return {
        code: '0000',
        msg: '',
        data: res.data[0]
      }
    } else if (res.data.length < 1) {
      return {
        code: '2001',
        msg: 'event ' + code + ' not exists.',
        data: res.data
      }
    }
  } catch (e) {
    return {
      code: '3001',
      msg: e,
      data: null
    }
  }
}

//禁用事件
async function disableCustomEventToEventList(data, _id) {
  const {
    code = '',
      disabled = ''
  } = data;

  if (data.action === 'delete') {
    try {
      const res = await COLION.doc(_id).remove();
      if (res.stats.removed < 1) {
        return {
          msg: res.errMsg,
          code: '2002',
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
        code: '3002',
        msg: '',
        data: e
      };
    }
  } else {
    try {
      const res = await COLION.doc(_id).update({
        data: {
          disabled
        }
      });
      if (res.stats.updated < 1) {
        return {
          msg: 'no record updated',
          code: '2003',
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
        code: '3003',
        msg: e,
        data: null
      };
    }
  }

}
/**
 * {
 *  code = '',
 *  disabled = '',
 *  action = ''
 * } 
 **/
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const checkParam = checkParamFormat(event);
  if (checkParam.code !== '0000') {
    return checkParam
  }
  const permission = await checkPermision();
  if (permission.code !== '0000') {
    return permission;
  }
  const bEvent = await checkEvent(event.code);
  if (bEvent.code !== '0000') {
    return bEvent;
  }
  const customEvent = await disableCustomEventToEventList(checkParam.data, bEvent.data._id);
  if (customEvent.code !== '0000') {
    return customEvent;
  }
  const msg = event.action === 'delete' ? 'you need to delete other ' + event.code + '\'s collections by yourself' : '';
  return {
    msg,
    code: '0000',
    data: customEvent.data
  }
}