const Task = require("../models/taskModel");
const Queue = require("bull");
const { sendEmail, sendNewsletter } = require("../../aws_run1");
const EmailCampaign = require("../models/emailCampaignModel");

const emailQueue = new Queue("emailTasks", {
  redis: {
    host: process.env.radis_hostname,
    port: process.env.redis_port,
    password: process.env.redis_password,
  },
});

// Worker
emailQueue.process(async (job, done) => {
  console.log("job", job);
  await sendNewsletter(job.data.campaign);
  await EmailCampaign.findByIdAndUpdate(
    { _id: job.data.campaign._id },
    {
      $set: {
        status: "sent",
      },
    }
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
