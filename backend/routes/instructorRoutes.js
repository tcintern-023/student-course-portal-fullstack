const express = require("express");
const router = express.Router();

const {
  getAllInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
} = require("../controllers/instructorController");

const { validateCreateInstructor, validateUpdateInstructor } = require("../middleware/validateInstructor");
const { validateIdParam } = require("../middleware/validateId");
const { authenticate, authorize } = require("../middleware/auth");

// Same reasoning as courseRoutes.js: instructors are managed catalog data,
// not user-owned, so this is plain RBAC — admin only for writes.
router.get("/", getAllInstructors);
router.get("/:id", validateIdParam, getInstructorById);
router.post("/", authenticate, authorize("admin"), validateCreateInstructor, createInstructor);
router.put("/:id", authenticate, authorize("admin"), validateIdParam, validateUpdateInstructor, updateInstructor);
router.delete("/:id", authenticate, authorize("admin"), validateIdParam, deleteInstructor);

module.exports = router;
