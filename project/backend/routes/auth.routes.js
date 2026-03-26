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
module.exports = router;