const { createClient } = require('redis');

const redisClient = createClient({
    url: "redis://localhost:6379",
}) 

redisClient.on('connect', () => {
        console.log("✅ Redis Connected");
    })

redisClient.on('error', (err) => {
    console.error("❌ Redis Error:", err);
})

async function connectRedis(){
    await redisClient.connect();
}

const publisher = redisClient.duplicate();

const subscriber = redisClient.duplicate();



module.exports = { 
    redisClient,
    connectRedis,
    publisher,
    subscriber,
}