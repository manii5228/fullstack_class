const router = require("express").Router();
const controller = require("../controllers/user.controller");

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.post("/", auth, role("ADMIN"), controller.createUser);
router.get("/", auth, role("ADMIN"), controller.getUsers);
router.put("/:id", auth, role("ADMIN"), controller.updateRole);

module.exports = router;