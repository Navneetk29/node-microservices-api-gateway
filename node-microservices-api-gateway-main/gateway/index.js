const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const {
    redisClient,
    connectRedis,
    publisher,
    subscriber,
} = require("./config/redis");
const { checkRateLimit } = require("./middleware/rateLimiter");
const { checkHealth } = require("./services/health.service");
const { proxyRequest } = require("./services/proxy.service");
const { reloadRoutes } = require("./services/registry.service");
const gatewayState = require("./state/gatewayState");
const gatewayRoutes = require("./routes/gateway.routes");
const { publishCurrentSecondMetrics } = require("./services/liveMetrics.service");
const { publishSystemInfo } = require('./services/system-info');
const cors = require("cors");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "*",
    }),
);

app.use(express.json());

app.use("/", gatewayRoutes);

const PORT = 3000;
const HEALTH_CHECK_INTERVAL = 10000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log(`Dashboard connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`Dashboard disconnected: ${socket.id}`);
    });
});

setInterval(() => {
    checkHealth(gatewayState.routes);
}, HEALTH_CHECK_INTERVAL);

setInterval(() => {
    publishCurrentSecondMetrics().catch((error) => {
        console.error("Error publishing live metrics: ", error);
    });
    // publishSystemInfo().catch((err) => {
    //     console.error("Error publishing live system info: ", err);
    // });
}, 1000);

setInterval(async () => {
    const systemData = await publishSystemInfo();
    io.emit('system:info' , systemData);
}, 500);

async function setupLiveMetrics(io) {
    await subscriber.subscribe("gateway:live-metrics", (message) => {
        const metrics = JSON.parse(message);
        io.emit("metrics:update", metrics);
    });
    // await subscriber.subscribe('gateway:system-info' , (data) => {
    //     const systemData = JSON.parse(data);
    //     io.emit('system:info' , systemData);
    // })
    
}

async function start() {
    try {
        await connectRedis();
        await publisher.connect();
        await subscriber.connect();
        await reloadRoutes();
        await checkHealth(gatewayState.routes);
        await setupLiveMetrics(io);
        httpServer.listen(PORT, () => {
            console.log(`Gateway running on ${PORT} ✅`);
        });
    } catch (err) {
        console.error("Failed to start gateway:", err);
        process.exit(1);
    }
}

start();
