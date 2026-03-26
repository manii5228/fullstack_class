const router = require("express").Router();
const controller = require("../controllers/analytics.controller");
const auth = require("../middleware/auth.middleware");

router.get("/dashboard",auth,controller.dashboard);

module.exports = router;