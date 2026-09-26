// gateway/serviceRegistry.js

class ServiceRegistry {
    constructor({
        gatewayUrl,
        serviceDetails,
        retryInterval = 5000,
    }) {
        this.gatewayUrl = gatewayUrl;
        this.serviceDetails = serviceDetails;
        this.retryInterval = retryInterval;

        this.registrationRetryTimer = null;
        this.isRegistered = false;
        this.isShuttingDown = false;
    }

    async register() {
        try {
            const response = await fetch(
                `${this.gatewayUrl}/add_service`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.serviceDetails),
                }
            );

            const data = await response.json();

            if (data.success) {
                this.isRegistered = true;

                if (this.registrationRetryTimer) {
                    clearInterval(this.registrationRetryTimer);
                    this.registrationRetryTimer = null;
                }

                console.log(
                    `Service "${this.serviceDetails.name}" registered successfully ✅`
                );

                console.log(data.message);

                return true;
            }

            console.log(
                `Service registration failed: ${data.message}`
            );

            return false;

        } catch (err) {
            console.log(
                `Could not connect to gateway: ${err.message}`
            );

            return false;
        }
    }

    startRetry() {
        if (this.registrationRetryTimer) {
            return;
        }

        this.registrationRetryTimer = setInterval(async () => {
            if (this.isRegistered) {
                this.stopRetry();
                return;
            }

            console.log(
                `Retrying registration of "${this.serviceDetails.name}"...`
            );

            await this.register();

        }, this.retryInterval);
    }

    stopRetry() {
        if (this.registrationRetryTimer) {
            clearInterval(this.registrationRetryTimer);
            this.registrationRetryTimer = null;
        }
    }

    async unregister() {
        if (!this.isRegistered) {
            return;
        }

        try {
            console.log(
                `Removing service "${this.serviceDetails.name}" from gateway...`
            );

            const response = await fetch(
                `${this.gatewayUrl}/remove_service`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.serviceDetails),
                }
            );

            const data = await response.json();

            console.log(data.message);

            this.isRegistered = false;

        } catch (err) {
            console.log(
                `Could not remove service from gateway: ${err.message}`
            );
        }
    }

    async connect() {
        const registered = await this.register();

        if (!registered) {
            this.startRetry();
        }
    }

    async disconnect() {
        this.stopRetry();
        await this.unregister();
    }
}

module.exports = ServiceRegistry;