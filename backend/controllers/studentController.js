const studentModel = require("../models/studentModel");
const ApiError = require("../middleware/ApiError");

const getAllStudents = async (req, res, next) => {
  try {
    const students = await studentModel.getAll();
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err) {
    next(err);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await studentModel.getById(req.params.id);
    if (!student) throw new ApiError(404, `Student with id ${req.params.id} not found`);
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/students/me — requires `authenticate` + `attachOwnStudent`.
 * Returns the student profile linked to the logged-in user, or null if they
 * don't have one. Lets the frontend know "which card is mine" without
 * exposing every user's linked student id through the public list endpoint.
 */
const getMyStudentProfile = async (req, res, next) => {
  try {
    if (!req.ownStudentId) {
      return res.status(200).json({ success: true, data: null });
    }
    const student = await studentModel.getById(req.ownStudentId);
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

/** @route POST /api/students — admin only (see routes/studentRoutes.js) */
const createStudent = async (req, res, next) => {
  try {
    const newStudent = await studentModel.create(req.body);
    res.status(201).json({ success: true, data: newStudent });
  } catch (err) {
    if (err.code === "23505") return next(new ApiError(400, `A student with email ${req.body.email} already exists`));
    next(err);
  }
};

/**
 * @route PUT /api/students/:id — requires `authenticate` + `attachOwnStudent`.
 * Ownership-based authorization: admins can update any student profile;
 * everyone else can only update the profile linked to their own account.
 */
const updateStudent = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const isOwner = req.ownStudentId === req.params.id;

    if (!isAdmin && !isOwner) {
      // Authenticated, just not allowed to touch *this* resource -> 403,
      // not 401 (401 would wrongly imply they aren't logged in at all).
      throw new ApiError(403, "You can only update your own student profile.");
    }

    const updated = await studentModel.update(req.params.id, req.body);
    if (!updated) throw new ApiError(404, `Student with id ${req.params.id} not found`);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    if (err.code === "23505") return next(new ApiError(400, `A student with email ${req.body.email} already exists`));
    next(err);
  }
};

/** @route DELETE /api/students/:id — admin only (see routes/studentRoutes.js) */
const deleteStudent = async (req, res, next) => {
  try {
    const deleted = await studentModel.remove(req.params.id);
    if (!deleted) throw new ApiError(404, `Student with id ${req.params.id} not found`);
    res.status(200).json({ success: true, message: `Student with id ${req.params.id} deleted successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getMyStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent,
};
