const express = require("express");
const router = express.Router();

const { register, login, me } = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middleware/validateAuth");
const { authenticate } = require("../middleware/auth");

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", authenticate, me);

module.exports = router;
