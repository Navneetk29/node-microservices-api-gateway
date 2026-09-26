async function checkHealth(routes) {
    for (const [serviceName, servers] of Object.entries(routes)) {
        await Promise.all(
            servers.map(async (server) => {
                try {
                    const response = await fetch(server.url + "/health");
                    if (response.ok) {
                        server.healthy = true,
                            server.failureCount = 0;
                        console.log(`${server.url} recovered ✔️✔️`);
                    }
                } catch (err) {
                    server.healthy = false;
                    console.log(`${server.url} marked unhealthy ❌❌`);
                }
               
            })
        );
    }
}

module.exports = {checkHealth};