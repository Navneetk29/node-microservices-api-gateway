const {redisClient} = require('../config/redis');
const RATE_LIMIT = 20;

async function checkRateLimit(req) {
    const key = `rateLimit:${req.ip}`;
    const counter = await redisClient.incr(key);
    if (counter === 1) {
        await redisClient.expire(key, 60);
    }
    if (counter > RATE_LIMIT) {
        return true;
    }
    return false;
}

module.exports = {checkRateLimit};