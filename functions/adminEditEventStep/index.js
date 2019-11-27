// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const DB = cloud.database();
let COLION;
//检查参数格式
function checkParamFormat(data) {
  let {
    code,
    action,
    param,
    _id
  } = data;

  const defaultParam = {
    title: '',
    desc: '',
    tips: [],
    verifiers: [],
  }

  const res = {
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
      res.msg.push('code:string')
    }
  }

  if (action === undefined) {
    res.code = '1000';
    res.msg.push('action:string')
  } else {
    if (typeof(action) != 'string') {
      res.code = '1001';
      res.msg.push('action:string')
    } else {
      if (action != 'add' && action != 'remove' && action != 'edit') {
        res.code = '1001';
        res.msg.push('action:string')
      } else {
        if (action === 'add' || action === 'edit') {
          if (param === undefined) {
            res.code = '1000';
            res.msg.push('param:object')
          } else {
            if (typeof(param) != 'object') {
              res.code = '1001';
              res.msg.push('param:object')
            } else {
              if (param['title'] == undefined && param['desc'] == undefined && param['tips'] == undefined && param['verifiers'] == undefined) {
                res.code = '1000';
                res.msg.push('param.title:string,param.desc:string,param.tips:array,param.verifiers:array');
              } else {
                if (param['title'] != undefined && (typeof(param['title']) != 'string' || param['title'] === '')) {
                  res.code = '1001';
                  res.msg.push('param.title:string')
                }
                if (param['desc'] != undefined && (typeof(param['desc']) != 'string' || param['desc'] === '')) {
                  res.code = '1001';
                  res.msg.push('param.desc:string')
                }
                if (param['tips'] != undefined && (!(param['tips'] instanceof Array) || param['tips'].length < 1)) {
                  res.code = '1001';
                  res.msg.push('param.tips:array')
                }
                if (param['verifiers'] != undefined && (!(param['verifiers'] instanceof Array) || param['verifiers'].length < 1)) {
                  res.code = '1001';
                  res.msg.push('param.verifiers:array')
                }
              }
            }
          }
        }

        if (action === 'edit' || action === 'remove') {
          if (_id === undefined) {
            res.code = '1000';
            res.msg.push('_id:string')
          }
        }
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
    res.msg = 'param format ok';
    var newParam = {};
    if (param != undefined) {
      for (let i in defaultParam) {
        if (param[i] !== undefined) {
          newParam[i] = param[i]
        }
      }
    }
    if (action === 'add') {
      param = {
        ...defaultParam,
        ...newParam
      }
    }
    if (action === 'edit') {
      param = newParam;
    }
    res.data = {
      code,
      action,
      param,
      _id
    }
  }
  return res;
}
//检查用户是否有admin权限
async function checkPermision() {
  const wxContext = cloud.getWXContext();
  //角色验证
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo',
      data: {
        open_id: wxContext.OPENID
      }
    })
    if (!curUserInfo.result.data.power.includes('event_admin')) {
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
      code: '1000',
      msg: e,
      data: null
    }
  }
}
// 检查事件是否已存在
async function checkEvent(code) {
  try {
    const res = await DB.collection('event_list').where({
      code
    }).get();

    if (res.data.length < 0) {
      return {
        code: '2001',
        msg: 'event ' + code + ' not exists.',
        data: null
      }
    }
    return {
      code: '0000',
      msg: '',
      data: res.data[0]._id
    }
  } catch (e) {
    return {
      code: '1001',
      msg: e,
      data: null
    }
  }
}

//检查的事件步骤是否存在
async function checkEventStep(_id) {
  try {
    const res = await COLION.doc(_id).get();
    if (res.errMsg !== 'document.get:ok') {
      return {
        code: '2002',
        msg: 'There is no such step in this event.',
        data: null
      }
    }
    return {
      code: '0000',
      msg: res.errMsg,
      data: res.data
    }
  } catch (e) {
    return {
      code: '1002',
      msg: e,
      data: null
    }
  }
}

//编辑步骤
async function editEventStep(data) {
  if (data.action === 'add') {
    return await addStep(data.param)
  }

  if (data.action === 'remove') {
    return await removeStep(data._id)
  }

  if (data.action === 'update') {
    return await updateStep(data)
  }
}
//添加步骤
async function addStep(data) {
  try {
    const res = await COLION.add({
      data
    });
    if (res['_id'] === undefined) {
      return {
        code: '2003',
        msg: res.errMsg,
        data: res
      }
    }
    return {
      code: '0000',
      msg: res.errMsg,
      data: res._id
    }
  } catch (e) {
    return {
      code: '1003',
      msg: e,
      data: null
    }
  }
}
//删除步骤
async function removeStep(_id) {
  const checkStep = await checkEventStep(_id);
  if (checkStep.code !== '0000') {
    return checkStep;
  }
  try {
    const res = await COLION.doc(_id).remove();
    if (res.stats.removed < 1) {
      return {
        code: '2004',
        msg: res.errMsg,
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
      code: '1004',
      msg: e,
      data: null
    };
  }
}
//修改步骤
async function updateStep(data) {
  const checkStep = await checkEventStep(data._id);
  if (checkStep.code !== '0000') {
    return checkStep;
  }
  try {
    const res = await COLION.doc(data._id).update({
      data: data.param
    });
    if (res.stats.updated < 1) {
      return {
        code: '2005',
        msg: res.errMsg,
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
      code: '1005',
      msg: e,
      data: null
    };
  }
}
// 云函数入口函数
/** 
 *  {
 *    code = '',
 *    action = '', [add|edit|remove]
 *    param = {
 *    title: '',
 *    desc: '',
 *    tips: [],
 *    verifiers:[]
 *    },
 *    _id='',
 * }
 **/
exports.main = async(event, context) => {
  const checkParam = checkParamFormat(event);
  if (checkParam.code !== '0000') {
    return checkParam;
  }

  COLION = DB.collection(event.code + '_event_steps');

  const permission = await checkPermision();
  if (permission.code !== '0000') {
    return permission;
  }
  const bEvent = await checkEvent(checkParam.data.code);
  if (bEvent.code !== '0000') {
    return bEvent;
  }

  return await editEventStep(checkParam.data);
}