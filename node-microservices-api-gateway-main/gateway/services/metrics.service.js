const { redisClient } = require("../config/redis");

function getCurrentMinuteKey() {
    const now = new Date();
    now.setSeconds(0, 0);
    return `metrics:minute:${now.toISOString()}`;
}

function getCurrentSecondKey() {
    const currSecond = Math.floor(Date.now() / 1000);
    return `metrics:second:${currSecond}`;
}

async function recordRequestMetrics({
    serviceName,
    instanceId,
    category,
    responseTime,
    statusCode,
}) {
    const globalKey = "metrics:global";

    const serviceKey = `metrics:service:${serviceName}`;

    const instanceKey = `metrics:instance:${serviceName}:${instanceId}`;

    const recentRequestsKey = "metrics:recent_requests";

    const minuteKey = getCurrentMinuteKey();

    const categoryToMetric = {
        success: "successfulRequests",

        clientError: "clientErrors",

        serverError: "serverErrors",

        gatewayError: "gatewayErrors",

        timeout: "timeoutRequests",
    };

    const metricField = categoryToMetric[category];

    if (!metricField) {
        throw new Error(`Invalid request category: ${category}`);
    }

    const timestamp = Date.now();
    const requestData = {
        serviceName,
        instanceId,
        category,
        statusCode: statusCode || null,
        responseTime,
        timestamp,
    };

    const multi = redisClient.multi();

    multi.hIncrBy(globalKey, "totalRequests", 1);

    multi.hIncrBy(globalKey, metricField, 1);

    multi.hIncrBy(globalKey, "totalResponseTime", responseTime);

    multi.hIncrBy(serviceKey, "totalRequests", 1);

    multi.hIncrBy(serviceKey, metricField, 1);

    multi.hIncrBy(serviceKey, "totalResponseTime", responseTime);

    multi.hIncrBy(instanceKey, "totalRequests", 1);

    multi.hIncrBy(instanceKey, metricField, 1);

    multi.hIncrBy(instanceKey, "totalResponseTime", responseTime);

    if (statusCode !== undefined && statusCode !== null) {
        multi.hSet(instanceKey, "lastStatusCode", statusCode);
    }

    multi.zAdd(recentRequestsKey, {
        score: timestamp,
        value: JSON.stringify(requestData),
    });

    multi.zRemRangeByRank(recentRequestsKey, 0, -101);

    multi.hIncrBy(minuteKey, "totalRequests", 1);

    multi.hIncrBy(minuteKey, metricField, 1);

    multi.hIncrBy(minuteKey, "totalResponseTime", responseTime);

    // Keep minute data for 6 minutes
    multi.expire(minuteKey, 360);

    // ----------
    const secondKey = getCurrentSecondKey();

    multi.hIncrBy(secondKey, "totalRequests", 1);

    multi.hIncrBy(secondKey, metricField, 1);

    multi.hIncrBy(secondKey, "totalResponseTime", responseTime);

    multi.expire(secondKey, 120);

    await multi.exec();
}

async function getLast60SecondsMetrics() {
    const currentSecond = Math.floor(Date.now() / 1000);
    const keys = [];

    for (let i = 59; i >= 0; i--) {
        const second = currentSecond - i;

        keys.push({
            second,
            key: `metrics:second:${second}`,
        });
    }

    const multi = redisClient.multi();

    for (const item of keys) {
        multi.hGetAll(item.key);
    }

    const results = await multi.exec();

    return results.map((metrics, index) => {
        const second = keys[index].second;

        const totalRequests = Number(metrics.totalRequests || 0);

        const successfulRequests = Number(metrics.successfulRequests || 0);

        const failedRequests =
            Number(metrics.clientErrors || 0) +
            Number(metrics.serverErrors || 0) +
            Number(metrics.gatewayErrors || 0) +
            Number(metrics.timeoutRequests || 0);

        return {
            timestamp: second * 1000,
            totalRequests,
            successfulRequests,
            failedRequests,
        };
    });
}

module.exports = {
    recordRequestMetrics,
    getLast60SecondsMetrics,
};
