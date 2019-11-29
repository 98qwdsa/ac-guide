const EVN_CODE = 'PROD'; // 'ENV'  'PROD'

const PROD = {
  cloud_env_code: 'prod-ayp2z'
}
const DEV = {
  cloud_env_code: 'demo-5c0mj'
}
module.exports = EVN_CODE === 'PROD' ? PROD : DEV