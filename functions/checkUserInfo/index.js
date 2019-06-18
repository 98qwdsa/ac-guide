// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

function checkParamFormat(event) {
  const wxContext = cloud.getWXContext();
  let {
    open_id,
    _id
  } = event;
  const res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (open_id === undefined && _id === undefined) {
    open_id = wxContext.OPENID;
  }
  if (open_id === undefined && _id != undefined) {
    if (typeof(_id) != 'string') {
      res.code = '1001';
      res.msg.push('_id:string');
    }
  }

  if (open_id != undefined) {
    if (typeof(open_id) != 'string') {
      res.code = '1001';
      res.msg.push('open_id:string');
    }
  }

  if (res.code === '1000') {
    res.msg = 'param ' + res.msg.join(' ') + ' is required';
  }

  if (res.code === '1001') {
    res.msg = 'param ' + res.msg.join(' ') + ' is wrong';
  }

  if (res.code === '0000') {
    res.msg = 'param format ok';
    res.data = {
      open_id,
      _id
    }
  }
  return res;
}

async function getUserInfo(data) {
  let {
    _id,
    open_id
  } = data;
  const excuseFn = _id ? CLION.doc(_id) : CLION.where({
    open_id
  })
  try {
    const res = await excuseFn.get();
    if (_id) {
      res.data = [res.data];
    }
    if (res.data.length < 1) {
      return {
        code: '2000',
        msg: 'don\'t find this userinfo',
        data: null
      }
    }
    return {
      code: '0000',
      msg: 'get userInfo success',
      data: res.data[0]
    }

  } catch (e) {
    if (_id) {
      return {
        code: '2000',
        msg: 'don\'t find this userinfo',
        data: null
      }
    }
    return {
      code: '3000',
      msg: e,
      data: null
    }
  }
}
const CLION = cloud.database().collection('user');
// 云函数入口函数
exports.main = async(event, context) => {
  const param = checkParamFormat(event);
  if (param.code != '0000') {
    return param;
  }

  return await getUserInfo(param.data)

}