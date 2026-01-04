const client = require('./client')

// Simple, short Redis command syntax examples for quick revision

async function main() {
    // STRINGS: set and get a simple key

    await client.set("name", "himalay")

    await client.get("name")

    // LISTS: create a list and read its elements

    await client.del("numbers")

    await client.rpush("numbers", 1, 2, 3)

    await client.lrange("numbers", 0, -1)

    // SETS: add unique members and read all members

    await client.del("tags")

    await client.sadd("tags", "redis", "node", "redis")

    await client.smembers("tags")

    // HASHES: store and retrieve a simple object-like structure

    await client.del("user:1")

    await client.hset("user:1", "name", "himalay", "role", "dev")

    await client.hgetall("user:1")

    // SORTED SETS: add scored members and read them with scores

    await client.del("scores")

    await client.zadd("scores", 10, "a", 20, "b")

    await client.zrange("scores", 0, -1, "WITHSCORES")
}

main()
    .then(() => {
        client.quit()
    })
    .catch((err) => {
        console.error("Redis error:", err)
        client.quit()
    })