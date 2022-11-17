const Redis = require('ioredis')
const dotenv = require('dotenv')

// load env
dotenv.config({ path: __dirname + '../../.env' })

exports.redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
})
