const {redisClient} = require('../config/redis');
const gatewayState  = require('../state/gatewayState');

async function loadServices() {
    const keys = await redisClient.keys('existingService:*');
    const values = await redisClient.mGet(keys);
    const services = {};
    keys.forEach((key, index) => {
        services[key.replace('existingService:', '')] = JSON.parse(values[index]);
    });
    // const data = Object.fromEntries(
    //     Object.entries(services).map(([service, urls]) => [
    //         service,
    //         urls.map(url => ({
    //             url,
    //             weight: 0,
    //             currentWeight: 0,
    //         }))
    //     ]),
    // );
    return services;
}

async function reloadRoutes() {
    try {
        gatewayState.routes = await loadServices();
        gatewayState.currentIndex = Object.fromEntries(
            Object.keys(gatewayState.routes).map(service => [service, 0])
        );
        // console.log(gatewayState.routes);
        //console.log(gatewayState.currentIndex);
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    loadServices,
    reloadRoutes,
};