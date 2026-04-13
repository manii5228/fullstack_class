require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

const limiter =
require("./backend/middleware/rateLimiter");

const app = express();

/* security middleware */
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

/* serve static frontend files */
app.use(
express.static(
path.join(__dirname,"frontend")
)
);

/* explicit root route */
app.get("/",(req,res)=>{

res.sendFile(

path.join(
__dirname,
"frontend",
"index.html"
)

);

});

/* API routes */
app.use("/api/auth",
require("./backend/routes/auth.routes")
);

app.use("/api/tasks",
require("./backend/routes/task.routes")
);

app.use("/api/users",
require("./backend/routes/user.routes")
);

app.use("/api/comments",
require("./backend/routes/comment.routes")
);

app.use("/api/analytics",
require("./backend/routes/analytics.routes")
);

app.use("/api/events",
require("./backend/routes/event.routes")
);

app.use("/api/teams",
require("./backend/routes/team.routes")
);

/* global error handler */
app.use(
require("./backend/middleware/error.middleware")
);

module.exports = app;