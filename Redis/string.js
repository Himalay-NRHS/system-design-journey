const client = require('./client')

// Simple, short examples for quick revision

async function main() {
    console.log("=== STRINGS ===")
    await client.set("name", "himalay")
    console.log("GET name ->", await client.get("name"))

    console.log("\n=== LISTS ===")
    await client.del("numbers")
    await client.rpush("numbers", 1, 2, 3)
    console.log("LRANGE numbers 0 -1 ->", await client.lrange("numbers", 0, -1))

    console.log("\n=== SETS ===")
    await client.del("tags")
    await client.sadd("tags", "redis", "node", "redis")
    console.log("SMEMBERS tags ->", await client.smembers("tags"))

    console.log("\n=== HASHES ===")
    await client.del("user:1")
    await client.hset("user:1", "name", "himalay", "role", "dev")
    console.log("HGETALL user:1 ->", await client.hgetall("user:1"))

    console.log("\n=== SORTED SETS ===")
    await client.del("scores")
    await client.zadd("scores", 10, "a", 20, "b")
    console.log(
        "ZRANGE scores 0 -1 WITHSCORES ->",
        await client.zrange("scores", 0, -1, "WITHSCORES")
    )
}

main()
    .then(() => {
        client.quit()
    })
    .catch((err) => {
        console.error("Redis error:", err)
        client.quit()
    })