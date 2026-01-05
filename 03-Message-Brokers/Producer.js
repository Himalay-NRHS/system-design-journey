// producer.js
const { Queue } = require("bullmq");
const connection = require("./redis");

// Create a queue
const emailQueue = new Queue("email-queue", {
  connection
});

async function addJob() {
  await emailQueue.add(
    "send-email",            // job name
    { to: "user@gmail.com" },// job data
    {
      attempts: 3,           // retries
      backoff: 5000          // wait 5s between retries
    }
  );

  console.log("Job added");
}

addJob();
