const gatewayState = require('../state/gatewayState');


// function gcd(a, b) {
//     while (b !== 0) {
//         const temp = b;
//         b = a % b;
//         a = temp;
//     }
//     return a;
// }

// function findArrayGCD(numbers) {
//     if (numbers.length === 0) return 0;
//     let result = numbers[0];
//     for (let i = 1; i < numbers.length; i++) {
//         result = gcd(result, numbers[i]);
//         if (result === 1) return 1; 
//     }
//     return result;
// }

// function getWeightedServers(servers) {
//     const capacities = servers.map(server => server.capacity);
//     const commonDivisor = findArrayGCD(capacities);
//     const ratios = capacities.map(capacity => capacity / commonDivisor);
//     const weightedServers = [];
//     for (let i = 0; i < servers.length; i++) {
//         let count = ratios[i];
//         while (count--) {
//             weightedServers.push(servers[i]);
//         }
//     }
//     return weightedServers;
// }

// function getNextWeightedServer(serviceName , healthyServers){

//     const weightedHealthyServers = getWeightedServers(healthyServers);

//     const startIndex = gatewayState.currentIndex[serviceName] % weightedHealthyServers.length;

//     const server =  weightedHealthyServers[startIndex];

//     gatewayState.currentIndex[serviceName] = (gatewayState.currentIndex[serviceName] + 1) % weightedHealthyServers.length;

//     return server;
// }


function getNextWeightedServer(serviceName , healthyServers){

    let totalWeight = 0;
    let selectedServer = null;

    for(const server of healthyServers){
        server.currentWeight += server.capacity;

        totalWeight += server.capacity;

        if(selectedServer === null || server.currentWeight > selectedServer.currentWeight){
            selectedServer = server;
        }
    }

    selectedServer.currentWeight -= totalWeight;
    
    return selectedServer;
}

module.exports = {
    getNextWeightedServer,
};