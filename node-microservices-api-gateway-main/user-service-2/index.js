const express = require("express");
const app = express();
app.use(express.json());
const PORT = 3005;
const GATEWAY_URL = 'http://localhost:3000';

const users = [
    { id: 1, name: "Raj" },
    { id: 2, name: "Aman" },
    { id: 3, name: "Priya" },
];

app.get("/health", (req, res) => {
    res.json({
        status: true,
    });
});

app.get("/users", async (req, res) => {
    // await new Promise(resolve => setTimeout(resolve, 5000));
    res.json({
        success: true,
        instance: "User Service 2",
        data: users
    });
});

// Get one user
app.get("/users/:id", (req, res) => {
    const user = users.find(
        u => u.id == req.params.id
    );
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }
    res.json({
        instance: "User Service 2",
        user,
    });
});

// Create user
app.post("/users", (req, res) => {
    users.push(req.body);
    res.json({
        message: "User created",
        instance: "User Service 2",
        user: req.body
    });
});

const RETRY_REGISTER_INTERVAL = 5000;
let registrationRetryTimer = null;
let isRegistered = false;

const serviceDetails = {
    name: 'users',
    url: `http://localhost:${PORT}`,
    capacity: 16,
}

// ---------------- REGISTER SERVICE ----------------

async function registerIntoGateway() {
    try {
        const response = await fetch(`${GATEWAY_URL}/add_service`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(serviceDetails),
        });
        const data = await response.json();
        if (data.success) {
            isRegistered = true;
            if (registrationRetryTimer) {
                clearInterval(registrationRetryTimer);
                registrationRetryTimer = null;
            }
            console.log("Successfully registered into gateway ✅");
            console.log(data.message);
            return;
        }
        console.log("Registration failed:", data.message);

    } catch (err) {
        console.log("error: ", err);
    }
}

// ---------------- RETRY REGISTRATION ----------------

function startRegistrationRetry() {
    if (registrationRetryTimer) {
        return;
    }
    registrationRetryTimer = setInterval(() => {
        if (isRegistered) {
            clearInterval(registrationRetryTimer);
            registrationRetryTimer = null;
            return;
        }
        console.log("Retrying registration into gateway...");
        registerIntoGateway();
    }, RETRY_REGISTER_INTERVAL);
}


// ---------------- REMOVE SERVICE ----------------

async function removeFromGateway() {
    try {
        console.log("Removing service from gateway...");
        const response = await fetch(`${GATEWAY_URL}/remove_service`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(serviceDetails),
        });

        const data = await response.json();

        console.log(data.message);

    } catch (err) {

        console.log(
            "Could not remove service from gateway:",
            err.message
        );

    }
}


// ---------------- GRACEFUL SHUTDOWN ----------------

let isShuttingDown = false;

async function gracefulShutdown(signal) {
    if (isShuttingDown) return;

    isShuttingDown = true;

    console.log(`${signal} received`);

    if (registrationRetryTimer) {
        clearInterval(registrationRetryTimer);
        registrationRetryTimer = null;
    }

    if (isRegistered) {
        await removeFromGateway();
        isRegistered = false;
    }

    server.close((err) => {
        if (err) {
            console.error("Server close error:", err);
            return;
        }

        console.log("User service stopped gracefully ✅");
    });
}


// Listen for Ctrl + C
process.on("SIGINT", () => {
    gracefulShutdown("SIGINT");
});

// Listen for Docker/Kubernetes shutdown
process.on("SIGTERM", () => {
    gracefulShutdown("SIGTERM");
});


const server = app.listen(PORT, async() => {
    console.log(`User Service running on ${PORT} ✅`);
    await registerIntoGateway()
        .then(() => {
            if (!isRegistered) {
                startRegistrationRetry();
            }
        })

});
