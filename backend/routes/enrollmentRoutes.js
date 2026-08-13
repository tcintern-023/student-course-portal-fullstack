const express = require("express");
const router = express.Router();

const { getAllEnrollments, createEnrollment, deleteEnrollment } = require("../controllers/enrollmentController");
const { validateCreateEnrollment } = require("../middleware/validateEnrollment");
const { validateIdParam } = require("../middleware/validateId");

router.get("/", getAllEnrollments);
router.post("/", validateCreateEnrollment, createEnrollment);
router.delete("/:id", validateIdParam, deleteEnrollment);

module.exports = router;
