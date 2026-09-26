async function proxyRequest(server, req) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 3000);

    try {
        const url = server.url + req.originalUrl;

        const isBodyMethod = !["GET", "DELETE"].includes(req.method);

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",

            ...(req.headers.cookie && {
                Cookie: req.headers.cookie,
            }),

            ...(req.user && {
                "x-user-id": String(req.user.id),
                "x-user-email": req.user.email,
            }),
        };

        const response = await fetch(url, {
            method: req.method,
            headers,
            signal: controller.signal,
            body: isBodyMethod ? new URLSearchParams(req.body).toString() : undefined,
        });

        const data = await response.json();

        return {
            status: response.status,
            data,
            setCookie: response.headers.get("set-cookie"),
        };
    } finally {
        clearTimeout(timeout);
    }
}
module.exports = {
    proxyRequest,
};
