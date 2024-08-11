const Schedule = require("node-schedule");

const date = new Date(2024, 5, 8, 4, 17, 0);

const job = Schedule.scheduleJob(date, () => {
  console.log("Job runs");
});

console.log("job data:", job);
