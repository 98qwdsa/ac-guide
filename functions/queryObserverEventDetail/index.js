// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

function checkParamFormat(data) {
  const wxContext = cloud.getWXContext();
  let {
    code,
    open_id,
    page
  } = data
  // 初始化页面信息
  const defaultPageConf = {
    size: 10,
    current_num: 0
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

  if (open_id === undefined) {
    open_id = wxContext.OPENID;
  } else {
    if (typeof(open_id) != 'string') {
      res.code = '1001';
      res.msg.push('open_id:string')
    }
  }
  if (page === undefined) {
    page = defaultPageConf;
  } else {
    if (typeof(page) === 'object') {
      if (page['size'] === undefined) {
        page.size = defaultPageConf.size
      } else {
        if (typeof(page.size) != 'number') {
          res.code = '1001';
          res.msg.push('page.size:string')
        } else if (page.size > 20) {
          page.size = 20;
        }
      }
      if (page['current_num'] === undefined) {
        page.current_num = defaultPageConf.current_num
      } else {
        if (typeof(page.current_num) != 'number') {
          res.code = '1001';
          res.msg.push('page.current_num:string')
        }
      }
    } else {
      res.code = '1001';
      res.msg.push('page:object')
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
      code,
      open_id,
      page: {
        ...defaultPageConf,
        ...page
      }
    }
  }
  return res;
}

async function getObserverUserOpenId(data) {
  try {
    const DB = cloud.database();
    const _ = DB.command;
    const res = await DB.collection(data.code + '_event_observeds').where({
      observer_open_id: _.in([data.open_id])
    }).get()
    // if (res.data.length < 1) {
    //   return {
    //     code: '2000',
    //     msg: 'not records',
    //     data: null
    //   }
    // }
    return {
      code: '0000',
      msg: res.errMsg,
      data: res.data.map(e => e.observed_open_id)
    }
  } catch (e) {
    return {
      code: '3000',
      msg: e,
      data: null
    }
  }
}
//角色验证
async function checkRole() {
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo',
    })
    if (!curUserInfo.result.data.role.includes('Observer')) {
      return {
        msg: 'role mismatch Function: queryObserverEventDetail',
        code: '2001',
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
      code: '3001',
      msg: e,
      data: null
    }
  }
}

async function getObserverEventDetail(param, openIdList) {
  const pageStart = param.page.current_num * param.page.size;
  const qyeryOpenIdList = openIdList.slice(pageStart, pageStart + param.page.size);
  try {
    const res = await cloud.callFunction({
      name: 'queryMultipleUserEventDetail',
      data: {
        code: param.code,
        user_open_id_list: qyeryOpenIdList,
      }
    });
    if (res.result.length < 1) {
      return {
        code: '2002',
        msg: '',
        data: null
      }
    }
    return {
      code: '0000',
      msg: '',
      data: {
        data: res.result,
        page_info: {
          ...param.page,
          count: openIdList.length
        }
      }
    };
  } catch (e) {
    return {
      code: '3002',
      msg: e,
      data: null
    }
  }
}
// 云函数入口函数
/**
 *  {
 *    code:'',// 事件code
 *    open_id:'', //用户open_id  默认为当前访问用的open_id
 *    page:{
 *      size:'', 每页数据量
 *      current_num:'' 当前加载的页数
 *    }
 *  }
 **/
exports.main = async(event, context) => {

  const param = await checkParamFormat(event);
  if (param.code !== '0000') {
    return param
  }
  //角色验证
  const role = await checkRole();
  if (role.code !== '0000') {
    return role
  }

  const observerUserOpenId = await getObserverUserOpenId(param.data);
  if (observerUserOpenId.code !== '0000') {
    return observerUserOpenId;
  }
  return await getObserverEventDetail(param.data, observerUserOpenId.data)
}