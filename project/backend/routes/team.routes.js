const router = require("express").Router();
const controller = require("../controllers/team.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, controller.createTeam);
router.get("/", auth, controller.getTeams);

module.exports = router;