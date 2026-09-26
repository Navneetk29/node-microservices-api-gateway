const { redisClient } = require("../config/redis");
const { reloadRoutes, loadServices } = require("../services/registry.service");
const { checkRateLimit } = require("../middleware/rateLimiter");
const gatewayState = require("../state/gatewayState");
const { proxyRequest } = require("../services/proxy.service");
const { getNextWeightedServer } = require("../services/loadBalancer.service");
const { recordRequestMetrics } = require("../services/metrics.service");
const { getLast60SecondsMetrics } = require('../services/metrics.service');
const { systemInfo } = require('../services/system-info');
const { json } = require("express");
const { checkToken } = require('../middleware/JWTtoken');

exports.addService = async (req, res) => {
    try {
        const { name, url, capacity } = req.body;
        if (!name || !url || !capacity) {
            return res.status(400).json({
                success: false,
                message: "required field missing",
            });
        }

        const existingService = await redisClient.get(`existingService:${name}`);
        if (!existingService) {
            const newUrlList = [
                {
                    url: url,
                    healthy: true,
                    failureCount: 0,
                    failureThreshold: 3,
                    capacity: capacity,
                    weight: 0,
                    currentWeight: 0,
                },
            ];
            await redisClient.set(
                `existingService:${name}`,
                JSON.stringify(newUrlList),
            );
            await reloadRoutes();
            console.log(
                "Routes after adding service:",
                JSON.stringify(gatewayState.routes, null, 2)
            );
            return res.status(201).json({
                success: true,
                message: `${url} is added to '${name}' service`,
            });
        } else {
            const urlList = JSON.parse(existingService);
            const existingUrl = urlList.find((item) => item.url === url);

            if (existingUrl) {
                existingUrl.capacity = capacity;
                await redisClient.set(
                    `existingService:${name}`,
                    JSON.stringify(urlList),
                );
                await reloadRoutes();
                return res.status(400).json({
                    success: true,
                    message: `${url} capacity updated to ${capacity} in '${name}' service`,
                });
            } else {
                urlList.push({
                    url: url,
                    healthy: true,
                    failureCount: 0,
                    failureThreshold: 3,
                    capacity: capacity,
                    weight: 0,
                    currentWeight: 0,
                });
                await redisClient.set(
                    `existingService:${name}`,
                    JSON.stringify(urlList),
                );
                await reloadRoutes();
                return res.status(201).json({
                    success: true,
                    message: `${url} is added to '${name}' service`,
                });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.getServices = async (req, res) => {
    try {
        const services = await loadServices();
        return res.status(200).json({
            success: true,
            services,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.removeService = async (req, res) => {
    try {
        const { name, url } = req.body;
        if (!url || !name) {
            return res.status(400).json({
                success: false,
                message: "required field missing",
            });
        }
        const existingService = await redisClient.get(`existingService:${name}`);

        const urlList = JSON.parse(existingService);

        const updatedUrlList = urlList.filter((item) => item.url !== url);

        if (updatedUrlList.length === urlList.length) {
            return res.status(404).json({
                success: false,
                message: `${url} not found in '${name}' service`,
            });
        }
        await redisClient.set(
            `existingService:${name}`,
            JSON.stringify(updatedUrlList),
        );

        await reloadRoutes();

        return res.status(200).json({
            success: true,
            message: `${url} removed from '${name}' service`,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

function formatMetrics(metrics) {
    const totalRequests = Number(metrics.totalRequests || 0);

    const successfulRequests = Number(metrics.successfulRequests || 0);

    const clientErrors = Number(metrics.clientErrors || 0);

    const serverErrors = Number(metrics.serverErrors || 0);

    const gatewayErrors = Number(metrics.gatewayErrors || 0);

    const timeoutRequests = Number(metrics.timeoutRequests || 0);

    const totalResponseTime = Number(metrics.totalResponseTime || 0);

    return {
        totalRequests,

        successfulRequests,

        clientErrors,

        serverErrors,

        gatewayErrors,

        timeoutRequests,

        successRate:
            totalRequests > 0
                ? Number(((successfulRequests / totalRequests) * 100).toFixed(2))
                : 0,

        clientErrorRate:
            totalRequests > 0
                ? Number(((clientErrors / totalRequests) * 100).toFixed(2))
                : 0,

        serverErrorRate:
            totalRequests > 0
                ? Number(((serverErrors / totalRequests) * 100).toFixed(2))
                : 0,

        gatewayErrorRate:
            totalRequests > 0
                ? Number(((gatewayErrors / totalRequests) * 100).toFixed(2))
                : 0,

        timeoutRate:
            totalRequests > 0
                ? Number(((timeoutRequests / totalRequests) * 100).toFixed(2))
                : 0,

        averageResponseTime:
            totalRequests > 0
                ? Number((totalResponseTime / totalRequests).toFixed(2))
                : 0,
    };
}

exports.getMetrics = async (req, res) => {
    try {
        const globalKey = "metrics:global";

        const globalMetrics = await redisClient.hGetAll(globalKey);

        const global = formatMetrics(globalMetrics);

        const serviceKeys = await redisClient.keys("metrics:service:*");

        const serviceResults = await Promise.all(
            serviceKeys.map(async (key) => {
                const serviceName = key.replace("metrics:service:", "");

                const metrics = await redisClient.hGetAll(key);

                return {
                    serviceName,

                    metrics: formatMetrics(metrics),
                };
            }),
        );

        const services = {};

        for (const service of serviceResults) {
            services[service.serviceName] = service.metrics;
        }

        return res.json({
            success: true,

            message: "Metrics data fetched",

            data: {
                global,
                services,
            },
        });
    } catch (error) {
        console.error("Error fetching metrics:", error);

        return res.status(500).json({
            success: false,

            message: "Failed to fetch metrics",
        });
    }
};

exports.getServiceInstancesMetrics = async (req, res) => {
    try {
        const { serviceName } = req.params;

        if (!serviceName) {
            return res.status(400).json({
                success: false,

                message: "serviceName is required",
            });
        }

        const instanceKeys = await redisClient.keys(
            `metrics:instance:${serviceName}:*`,
        );

        if (instanceKeys.length === 0) {
            return res.status(404).json({
                success: false,

                message: "No instance metrics found",
            });
        }

        const instances = await Promise.all(
            instanceKeys.map(async (key) => {
                const metrics = await redisClient.hGetAll(key);

                const prefix = `metrics:instance:${serviceName}:`;

                const instanceId = key.replace(prefix, "");

                return {
                    instanceId,

                    ...formatMetrics(metrics),
                };
            }),
        );

        return res.json({
            success: true,
            message: "Service instance metrics fetched",
            data: { serviceName, instances },
        });
    } catch (error) {
        console.error("Error fetching service instance metrics:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch service instance metrics",
        });
    }
};

exports.getRecentRequestsData = async (req, res) => {
    try {

        const recentRequestsKey = "metrics:recent_requests";
        const recentFiveMinDataKeys = await redisClient.keys('metrics:minute:*')
        console.log(recentFiveMinDataKeys);
        const recentReqData = await redisClient.zRange(
            recentRequestsKey,
            0, -1,
            { REV: true }
        )


        const recentFiveMinData = await Promise.all(
            recentFiveMinDataKeys.map(async (key) => {
                const metrics = await redisClient.hGetAll(key);
                const minuteStamp = key.replace('metrics:minute:', '');
                return {
                    minuteStamp,
                    metrics: formatMetrics(metrics)
                }
            })
        )

        console.log(recentFiveMinData);
        const parsedRecentReqData = recentReqData.map((item) => JSON.parse(item));

        return res.status(200).json({
            success: true,
            message: "recent req data fetched successfully",
            data: parsedRecentReqData,
            recentFiveMinData,
        })
    } catch (error) {
        console.error("error: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

exports.getLiveMetrics = async (req, res) => {
    try {
        const metrics = await getLast60SecondsMetrics();
        return res.status(200).json({
            success: true,
            data: metrics,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to get live metrics",
        });
    }
};

// exports.getSystemInfo = async (req, res) => {
//     try{
//         const systemData = await systemInfo();

//         console.log(systemData);

//         return res.status(200).json({
//             success: true,
//             message: "System data fetched successfully",
//             data: systemData
//         })

//     }catch(err){
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// }


async function handleFailiure(server, i, healthyServers) {
    console.log(`${server.url} failed`);
    server.failureCount++;
    if (server.failureCount >= server.failureThreshold) {
        server.healthy = false;
        console.log(
            `${server.url} marked unhealthy due to multiple timeout requests ❌❌`,
        );
    }
    if (i < healthyServers.length - 1) {
    }
}

function getResponseCategory(statusCode) {
    if (statusCode >= 200 && statusCode < 300) {
        return "success";
    }

    if (statusCode >= 400 && statusCode < 500) {
        return "clientError";
    }

    if (statusCode >= 500) {
        return "serverError";
    }

    return "unknown";
}

exports.handleProxyRequest = async (req, res) => {
    // const isRateLimited = await checkRateLimit(req);
    // if (isRateLimited) {
    //     await redisClient.incr("metrics:rateLimitedRequests");
    //     return res.status(429).json({
    //         success: false,
    //         message: "Too many requests"
    //     })
    // }

    const serviceName = req.originalUrl.split("/")[1];

    const publicRoutes = [
        "/auth/login",
        "/auth/register",
        "/auth/refresh"
    ];
    const isPublicRoute = publicRoutes.includes(req.originalUrl);
    if (!isPublicRoute) {
        const userData = checkToken(req);
        if (!userData) {
            return res.status(401).json({
                success: false,
                message: "Unaurthorised access",
            });
        }
        req.user = userData;
    }
    const servers = gatewayState.routes[serviceName];
    if (!servers) {
        return res.status(404).json({
            success: false,
            message: "Unknown service",
        });
    }

    const healthyServers = gatewayState.routes[serviceName].filter(
        (server) => server.healthy,
    );
    if (healthyServers.length === 0) {
        return res.status(503).json({
            success: false,
            message: "No healthy instances available",
        });
    }

    let lastError = null;

    const triedServers = new Set();
    let i = 0;
    while (triedServers.size < healthyServers.length) {
        const server = getNextWeightedServer(serviceName, healthyServers);

        if (triedServers.has(server.url)) {
            continue;
        }
        triedServers.add(server.url);
        const startTime = Date.now();
        try {
            const response = await proxyRequest(server, req);
            if (response.setCookie) {
                res.setHeader("Set-Cookie", response.setCookie);
            }
            const endTime = Date.now();
            const category = getResponseCategory(response.status);
            const responseTime = endTime - startTime;
            recordRequestMetrics({
                serviceName,
                instanceId: server.url,
                category,
                responseTime,
                statusCode: response.status,
            }).catch((error) => {
                console.error("Metrics recording failed:", error);
            });
            return res.status(response.status).json(response.data);
        } catch (err) {
            const endTime = Date.now();
            lastError = err;
            handleFailiure(server, i, healthyServers);
            recordRequestMetrics({
                serviceName,
                instanceId: server.url,
                category: err.name === "AbortError" ? "timeout" : "gatewayError",
                responseTime: endTime - startTime,
            }).catch((error) => {
                console.error("Metrics recording failed:", error);
            });
        }
        i++;
    }
    if (lastError.name === "AbortError") {
        return res.status(504).json({
            message: `${serviceName} service timed out`,
        });
    } else {
        return res.status(502).json({
            message: `${serviceName} Service unavailable`,
        });
    }
};

















































// exports.handleProxyRequest = async (req, res) => {
//     await redisClient.incr("metrics:totalRequests");

//     const isRateLimited = await checkRateLimit(req);
//     if (isRateLimited) {
//         await redisClient.incr("metrics:rateLimitedRequests");
//         return res.status(429).json({
//             success: false,
//             message: "Too many requests"
//         })
//     }

//     const serviceName = req.originalUrl.split("/")[1];
//     const servers = gatewayState.routes[serviceName];
//     if (!servers) {
//         await redisClient.incr("metrics:failedRequests");
//         return res.status(404).json({
//             success: false,
//             message: "Unknown service"
//         });
//     }

//     const healthyServers = gatewayState.routes[serviceName].filter(server => server.healthy);

//     if (healthyServers.length === 0) {
//         await redisClient.incr("metrics:failedRequests");
//         return res.status(503).json({
//             success: false,
//             message: "No healthy instances available"
//         });
//     }
//     const startIndex = gatewayState.currentIndex[serviceName] % healthyServers.length;

//     gatewayState.currentIndex[serviceName] = (gatewayState.currentIndex[serviceName] + 1) % healthyServers.length;

//     let lastError = null;

//     for (let i = 0; i < healthyServers.length; i++) {

//         const server = healthyServers[(startIndex + i) % healthyServers.length];

//         try {

//             const response = await proxyRequest(server, req);
//             if (response.status >= 200 && response.status < 300) {
//                 await redisClient.incr("metrics:successRequests");
//             }
//             return res.status(response.status).json(response.data);

//         } catch (err) {

//             lastError = err;

//             console.log(`${server.url} failed`);
//             server.failureCount++;
//             if (server.failureCount >= server.failureThreshold) {
//                 server.healthy = false;
//                 console.log(`${server.url} marked unhealthy due to multiple timeout requests ❌❌`);
//             }
//             if (i < healthyServers.length - 1) {
//                 await redisClient.incr("metrics:retryRequests");
//             }
//         }

//     }
//     if (lastError.name === "AbortError") {
//         await redisClient.incr("metrics:timeOutRequests");
//         await redisClient.incr("metrics:failedRequests");
//         return res.status(504).json({
//             message: `${serviceName} service timed out`,
//         });
//     } else {
//         await redisClient.incr("metrics:failedRequests");
//         return res.status(502).json({
//             message: `${serviceName} Service unavailable`,
//         });
//     }
// }
