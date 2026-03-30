const express = require("express")
const axios = require("axios")

// Reuse the shared Redis client
const client = require("./client")

// Simple Express app to demonstrate how Redis caching
// can make repeated requests much faster than calling
// the external API every time.

const app = express()

app.get("/", async (req, res) => {
    try {
        // 1. Try to read cached value from Redis

        const cacheValue = await client.get("todos")

        // 2. If we have cached data, return it immediately
        //    (this is where the response becomes very fast)

        if (cacheValue) {
            return res.json(JSON.parse(cacheValue))
        }

        // 3. Otherwise, make a slower external API call

        const { data } = await axios.get(
            "https://jsonplaceholder.typicode.com/todos"
        )

        // 4. Store the fresh data in Redis for next time
        //    and set a short TTL so it stays up to date

        await client.set("todos", JSON.stringify(data))

        await client.expire("todos", 30)

        // 5. Return the fresh data to the client

        return res.json(data)
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
})

app.listen(3000)
