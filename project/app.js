require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const limiter = require("./backend/middleware/rateLimiter");


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

app.use("/api/auth", require("./backend/routes/auth.routes"));
app.use("/api/tasks", require("./backend/routes/task.routes"));
app.use(require("./backend/middleware/error.middleware"));
app.use("/api/users",require("./backend/routes/user.routes"));
app.use("/api/tasks",require("./backend/routes/task.routes"));
app.use("/api/comments",require("./backend/routes/comment.routes"));
app.use("/api/analytics",require("./backend/routes/analytics.routes"));
app.use("/api/events",require("./backend/routes/event.routes"));
module.exports = app;