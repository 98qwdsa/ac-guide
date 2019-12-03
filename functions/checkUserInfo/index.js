// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

function checkParamFormat(event) {
  const wxContext = cloud.getWXContext();
  let {
    open_id = wxContext.OPENID,
      _id,
      name
  } = event;
  const res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (open_id === undefined && _id === undefined && name === undefined) {
    res.code = '1001';
    res.msg.push('_id:string, open_id:string, name:string');
  } else {

    if (_id && typeof(_id) != 'string') {
      res.code = '1001';
      res.msg.push('_id:string');
    }

    if (open_id && typeof(open_id) != 'string') {
      res.code = '1001';
      res.msg.push('open_id:string');
    }

    if (name && typeof(name) != 'string') {
      res.code = '1001';
      res.msg.push('name:string');
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
      _id,
      name
    }
  }
  return res;
}

async function getUserInfo(data) {
  let {
    _id,
    open_id,
    name
  } = data;

  let excuseFn = null;
  if (name) {
    excuseFn = CLION.where({
      name
    })
  }
  if (open_id) {
    excuseFn = CLION.where({
      open_id
    })
  }
  if (_id) {
    excuseFn = CLION.doc(_id)
  }


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