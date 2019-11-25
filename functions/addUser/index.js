// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const CLION = cloud.database().collection('user');
//检查参数格式
function checkParamFormat(data) {
  let {
    name
  } = data;
  const res = {
    code: '0000',
    msg: [],
    data: {
    }
  }
  if (name === undefined) {
    res.code = '1000'
    res.msg.push('name:string')
  } else {
    if (typeof(name) !== 'string' || name === '') {
      res.code = '1001'
      res.msg.push('name:string')
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
      name
    }
  }
  return res;
}


// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  const param = checkParamFormat(event);
  if (param.code != '0000') {
    return param;
  }
  try {
    const res = await CLION.add({
      data: {
        name: param.data.name,
        //event_attended: [],
        open_id: wxContext.OPENID,
        //phone: event.phone,
        power: [],
        role: ['Participant']
      }
    });

    if (!res._id) {
      return {
        code: '2000',
        msg: res.errMsg,
        data: ''
      };
    }
    return {
      code: '0000',
      msg: 'add user success',
      data: res._id
    }
  } catch (e) {
    return {
      code: '3000',
      msg: e,
      data: null
    }
  }
}