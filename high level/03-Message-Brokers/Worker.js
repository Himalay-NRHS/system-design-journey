// worker.js
const { Worker } = require("bullmq");
const connection = require("./redis");

// Create a worker
const worker = new Worker(
  "email-queue",        // same queue name
  async (job) => {
    console.log("Processing job:", job.id);
    console.log("Data:", job.data);

    // simulate slow work
    await new Promise((res) => setTimeout(res, 3000));

    console.log("Email sent");
  }, { connection}
);
