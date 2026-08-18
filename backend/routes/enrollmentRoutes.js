const express = require("express");
const router = express.Router();

const { getAllEnrollments, createEnrollment, deleteEnrollment } = require("../controllers/enrollmentController");
const { validateCreateEnrollment } = require("../middleware/validateEnrollment");
const { validateIdParam } = require("../middleware/validateId");
const { authenticate } = require("../middleware/auth");
const { attachOwnStudent } = require("../middleware/ownership");

router.get("/", authenticate, attachOwnStudent, getAllEnrollments);
router.post("/", authenticate, attachOwnStudent, validateCreateEnrollment, createEnrollment);
router.delete("/:id", authenticate, attachOwnStudent, validateIdParam, deleteEnrollment);

module.exports = router;
