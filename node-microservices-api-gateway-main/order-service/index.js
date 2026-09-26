const express = require("express");

const app = express();

app.use(express.json());
const PORT = 3003;
const GATEWAY_URL = 'http://localhost:3000';

const orders = [
    {
        id: 1,
        name: "Laptop",
        price: 60000
    },
    {
        id: 2,
        name: "Mouse",
        price: 800
    },
    {
        id: 3,
        name: "Keyboard",
        price: 1500
    }
];

app.get("/health", (req, res) => {
    res.json({
        status: true,
    });
});

app.get("/orders", (req, res) => {

    res.json({
        success: true,
        data: orders,
    });

});

app.get("/orders/:id", (req, res) => {

    const order = orders.find(
        p => p.id == req.params.id
    );

    if (!order) {
        return res.status(404).json({
            message: "order not found"
        });
    }

    res.json({
        success: true,
        data: order,
    });

});

app.post("/orders", (req, res) => {

    orders.push(req.body);

    res.json({
        message: "order Added",
        product: req.body
    });

});


const RETRY_REGISTER_INTERVAL = 5000;
let registrationRetryTimer = null;
let isRegistered = false;

const serviceDetails = {
    name: 'orders',
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

        console.log("Order service stopped gracefully ✅");
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


const server = app.listen(PORT, async () => {
    console.log(`Order Service running on ${PORT} ✅`);
    await registerIntoGateway()
        .then(() => {
            if (!isRegistered) {
                startRegistrationRetry();
            }
        })

});
