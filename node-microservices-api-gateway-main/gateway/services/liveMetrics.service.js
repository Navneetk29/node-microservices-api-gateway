const { redisClient, publisher } = require("../config/redis");

async function publishCurrentSecondMetrics() {
    const currentSecond = Math.floor(Date.now() / 1000);

    // We read the previous second.
    // The current second may still be receiving requests.
    const second = currentSecond - 1;

    const key = `metrics:second:${second}`;

    const metrics = await redisClient.hGetAll(key);
   
    const totalRequests = Number(metrics.totalRequests || 0);

    const successfulRequests = Number(metrics.successfulRequests || 0);

    const failedRequests =
        Number(metrics.clientErrors || 0) +
        Number(metrics.serverErrors || 0) +
        Number(metrics.gatewayErrors || 0) +
        Number(metrics.timeoutRequests || 0);

    const data = {
        timestamp: second * 1000,
        totalRequests,
        successfulRequests,
        failedRequests,
    };

    await publisher.publish("gateway:live-metrics", JSON.stringify(data));
}

module.exports = {
    publishCurrentSecondMetrics,
};
