const Task = require("../models/taskModel");
const emailQueue = require("../queue/taskQueue");
const Schedule = require("node-schedule");

exports.createTask = async (req, res) => {
  try {
    const { email, subject, body } = req.body;
    console.log("immediate call");

    const task = new Task({
      user: req.user.id,
      emailObj: {
        email,
        subject,
        body,
      },
    });
    await task.save();
    console.log("data save");

    emailQueue.add({ taskId: task.id, email, subject, body });
    console.log("pushed to queue");
    res.json({ task });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.createTaskSchedule = async (req, res) => {
  try {
    const { email, subject, body, scheduledDate } = req.body;
    console.log("scheduled call");
    const task = new Task({
      user: req.user.id,
      emailObj: { email, subject, body },
      scheduledDate: scheduledDate,
      isScheduled: true,
    });
    await task.save();

    Schedule.scheduleJob(scheduledDate, async () => {
      emailQueue.add({ taskId: task.id, email, subject, body });
    });

    res.json({ task });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }
    res.json({ task });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getAllTaskStatus = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    if (!tasks) {
      return res.status(404).json({ msg: "Task not found" });
    }
    res.json({ tasks });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
