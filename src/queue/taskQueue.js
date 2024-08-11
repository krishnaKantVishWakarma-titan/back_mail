const Task = require("../models/taskModel");
const Queue = require("bull");
const { sendEmail } = require("../../aws_run1");

const emailQueue = new Queue("emailTasks", {
  redis: {
    host: process.env.radis_hostname,
    port: process.env.redis_port,
    password: process.env.redis_password,
  },
});

// Worker
emailQueue.process(async (job, done) => {
  // await new Promise(resolve => setTimeout(resolve, 60000));
  const resEmail = await sendEmail(
    job.data.email[0],
    job.data.subject,
    job.data.body
  );
  console.log("res email: ", resEmail);
  console.log("job", job);
  await Task.findByIdAndUpdate(
    job.data.taskId,
    {
      status: "Completed",
      // response: res
    },
    { new: true }
  );
  console.log("job done");
  done();
});

emailQueue.on("completed", async (job) => {
  // const task = await Task.findById(job.data.taskId);
  console.log("task completed");
});

emailQueue.on("failed", async (job, err) => {
  // const task = await Task.findById(job.data.taskId);
  console.log("task failed");
});

module.exports = emailQueue;
