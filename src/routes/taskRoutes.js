const express = require("express");
const {
  createTask,
  getTaskStatus,
  getAllTaskStatus,
  createTaskSchedule,
} = require("../controllers/taskController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", auth, createTask);
router.post("/schedule", auth, createTaskSchedule);
router.get("/:id", auth, getTaskStatus);
router.get("/", auth, getAllTaskStatus);

module.exports = router;
