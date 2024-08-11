require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const emailQueue = require("./src/queue/taskQueue");

// Bull board
const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const app = express();

connectDB();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullAdapter(emailQueue)],
  serverAdapter,
});

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,x-auth-token"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use("/admin/queues", serverAdapter.getRouter());

app.use(express.json({ extended: false }));

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/tasks", require("./src/routes/taskRoutes"));

// Health check route
app.get("/", async (req, res) => {
  res.send("Hello, world!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
