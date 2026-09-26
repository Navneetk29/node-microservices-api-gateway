const si = require("systeminformation");
const { redisClient, publisher } = require('../config/redis');

async function publishSystemInfo() {
    try {
        const [currentLoad, mem, processes] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.processes(),
        ]);

        const currentProcess = processes.list.find(
            (p) => p.pid === process.pid
        );

        const bytesToKB = (bytes) => Number((bytes / 1024).toFixed(2));
        const bytesToMB = (bytes) => Number((bytes / 1024 / 1024).toFixed(2));

        const app = {
            pid: process.pid,
            cpuUsage: Number((currentProcess?.cpu || 0).toFixed(2)), // %
            memoryUsedKB: bytesToKB(currentProcess?.memRss || 0),
        };

        const host = {
            totalCpuUsage: Number(currentLoad.currentLoad.toFixed(2)), // %
            totalMemoryMB: bytesToMB(mem.total),
            usedMemoryMB: bytesToMB(mem.used),
            freeMemoryMB: bytesToMB(mem.free),
        };

        const systemData = {
            app,
            host
        }
        //publisher.publish('gateway:system-info' , JSON.stringify(systemData));
        return systemData;

    } catch (err) {
        console.log("error: ", err)
    }

};


module.exports = {
    publishSystemInfo,
}





