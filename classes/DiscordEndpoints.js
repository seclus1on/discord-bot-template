class DiscordClient {
    constructor(token = "", log = () => { }) {
        this.token = token;
        this.log = log;
        this.user = null;

        this.api = "/api/v9/";
        this.headers = {
            "Authorization": this.token,
            "Host": "discord.com",
            "Content-Type": "application/json"
        }
    }

    async #req(path, options, name = "") {
        if (!this.token || typeof this.token !== "string") return { status: 401, body: null };

        const url =
            typeof path === "string" && path.startsWith("http")
                ? path
                : `https://${this.headers.Host}${this.api}${path}`;

        this.headers.Host = new URL(url).host;

        if (options.body && typeof options.body === "object") this.headers["Content-Length"] = Buffer.byteLength(options.body);

        this.log(`attempting ${name} request to ${url}, ${options.method || "GET"}`);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.headers,
                    ...(options.headers || {})
                },
                signal: AbortSignal.timeout(15000)
            });

            this.log(`response status: ${response.status}`);
            if (response.status === 429) return { status: 429, body: { errorMsg: "rate limited, try again later.", errorCode: 429 } };

            if ([502, 503, 504].includes(response.status) || response.status >= 500) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.#req(path, options, name);
            }

            const text = await response.text();
            let body;

            try { body = JSON.parse(text); } catch (e) { body = null; }
            return { status: response.status, body };
        } catch (error) {
            this.log(`failed ${name} request to ${url}: ${error.message}`);
            return { status: 500, body: null };
        }
    }

    async init() {
        const response = await this.#req("/users/@me", {
            method: "GET"
        }, "init")
        
        response.status === 200 
        ? this.user = response.body 
        : (() => { throw new Error("Failed to initialize Discord client, please make sure the token is correct :)") })();
    }

    async getAllMembers(guildId, search = {}, limit = 250, sort = 1) {
        // 1 = newest first 
        // 2 = oldest first 
        // 3 = newest to discord 
        // 4 = oldest to discord 
        
        return await this.#req(`/guilds/${guildId}/members-search`, {
            method: "POST",
            body: JSON.stringify({
                ...(search ? this.buildMemberQuery(search) : {}), sort, limit
            })
        }, "getAllMembers")
    }

    async getPending(guildId, typeOf = "SUBMITTED", limit = 100) {
        return await this.#req(`/guilds/${guildId}/requests?status=${typeOf}&limit=${limit}`, {
            method: "GET"
        }, "getPending");
    }

    async getUserRequest(guildId, userId) {
        return await this.#req(`/guilds/${guildId}/requests/users/${userId}`, {
            method: "GET"
        }, "getUserRequest");
    }

    async doRequest(guildId, requestId, action = "APPROVED") {
        return await this.#req(`/guilds/${guildId}/requests/${requestId}`, {
            method: "PATCH",
            body: JSON.stringify({
                action
            })
        }, "doRequest");
    }

    buildMemberQuery(input = {}) {
        const query = { or_query: {}, and_query: {} }

        if (!input.username) return query

        query.and_query.usernames = {
            or_query: Array.isArray(input.username)
                ? input.username
                : [input.username]
        }

        return query
    }
}

module.exports = DiscordClient;
