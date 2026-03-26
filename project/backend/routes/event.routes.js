const router = require("express").Router();

const controller =
require("../controllers/event.controller");

const auth =
require("../middleware/auth.middleware");

router.post("/",
auth,
controller.createEvent
);

router.get("/",
auth,
controller.getEvents
);

module.exports = router;