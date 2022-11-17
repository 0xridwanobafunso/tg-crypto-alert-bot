const Redis = require('ioredis')
const env = require('../env')

exports.redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
})
