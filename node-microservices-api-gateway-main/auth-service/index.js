const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const ServiceRegistry = require("./serviceRegistry");

const app = express();

const PORT = 5050;

const JWT_TOKEN_SECRET_KEY = "d7iJljSFwLkT4rIC9xQKbVDqXBma8a1tQenUIqSFdyT";

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ---------------- ROUTES ----------------

app.get("/health", (req, res) => {
    res.json({
        status: true,
    });
});

app.get("/auth/check-auth", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Auth service is running",
    });
});

app.post("/auth/login", (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "missing required field",
            });
        }

        const user = {
            id: 123,
            email: "rajneesh@gmail.com",
            password: "123456",
        };

        if (email !== user.email || password !== user.password) {
            return res.status(400).json({
                success: false,
                message: "incorrect email or password",
            });
        }

        const userData = {
            id: user.id,
            email: user.email,
        };

        const token = jwt.sign(userData, JWT_TOKEN_SECRET_KEY, {
            expiresIn: "7d",
        });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
        });
    } catch (err) {
        console.log("error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// ---------------- SERVICE REGISTRY ----------------

const serviceRegistry = new ServiceRegistry({
    gatewayUrl: "http://localhost:3000",

    serviceDetails: {
        name: "auth",
        url: `http://localhost:${PORT}`,
        capacity: 8,
    },

    retryInterval: 5000,
});

// ---------------- GRACEFUL SHUTDOWN ----------------

let isShuttingDown = false;

async function gracefulShutdown(signal) {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;

    console.log(`${signal} received`);

    await serviceRegistry.disconnect();

    server.close((err) => {
        if (err) {
            console.error("Server close error:", err);
            process.exit(1);
        }

        console.log("Auth service stopped gracefully ✅");

        process.exit(0);
    });
}

process.on("SIGINT", () => {
    gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
    gracefulShutdown("SIGTERM");
});

// ---------------- START SERVER ----------------

const server = app.listen(PORT, async () => {
    console.log(`Auth Service running on ${PORT} ✅`);

    await serviceRegistry.connect();
});
