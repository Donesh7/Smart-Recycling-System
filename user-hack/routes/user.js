const express = require("express");
const router = express.Router();
const usercontroller = require("../controllers/user");

router.get("/", usercontroller.gethome);
router.get("/login", usercontroller.getlogin);
router.get("/dash", usercontroller.getdash);
router.post("/post-user", usercontroller.postuser);
router.post("/get-user", usercontroller.getuser);

module.exports = router;
