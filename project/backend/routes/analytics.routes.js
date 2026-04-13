const router = require("express").Router();
const controller = require("../controllers/analytics.controller");
const heatmapController = require("../controllers/heatmap.controller");
const auth = require("../middleware/auth.middleware");

router.get("/dashboard",auth,controller.dashboard);
router.get("/heatmap",auth,heatmapController.heatmap);

module.exports = router;