const express = require("express");
const router = express.Router();

const { getAllEnrollments, createEnrollment, deleteEnrollment } = require("../controllers/enrollmentController");
const { validateCreateEnrollment } = require("../middleware/validateEnrollment");
const { validateIdParam } = require("../middleware/validateId");
const { authenticate } = require("../middleware/auth");

router.get("/", getAllEnrollments);
router.post("/", authenticate, validateCreateEnrollment, createEnrollment);
router.delete("/:id", authenticate, validateIdParam, deleteEnrollment);

module.exports = router;
