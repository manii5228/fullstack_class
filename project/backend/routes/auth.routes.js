const router = require("express").Router();

const controller =
require("../controllers/auth.controller");

router.post("/login",
controller.login
);

router.post(
"/logout",
require("../middleware/auth.middleware"),
controller.logout
);

router.get("/profile",
require("../middleware/auth.middleware"),
controller.profile
);

module.exports = router;