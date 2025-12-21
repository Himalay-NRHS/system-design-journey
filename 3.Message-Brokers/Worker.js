// worker.js
const { Worker } = require("bullmq");
const connection = require("./redis");

// Create a worker
const worker = new Worker(
  "email-queue",             // same queue name
  async (job) => {
    console.log("Processing job:", job.id);
    console.log("Data:", job.data);

    // simulate work
    if (Math.random() < 0.5) {
      throw new Error("Random failure");
    }

    return "Email sent";
  },
  {
    connection,
    concurrency: 5            // 5 jobs in parallel
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed:`, err.message);
});
