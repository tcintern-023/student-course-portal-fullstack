const enrollmentModel = require("../models/enrollmentModel");
const studentModel = require("../models/studentModel");
const courseModel = require("../models/courseModel");
const ApiError = require("../middleware/ApiError");

/**
 * @route GET /api/enrollments — requires `authenticate` + `attachOwnStudent`.
 * "View enrolled students" is an admin capability, not a public one, so
 * this now requires login. Admins can list/filter freely (that's the
 * roster view). A non-admin can only ever see their own enrollments —
 * this is what powers their dashboard — regardless of what studentId they
 * pass in the query string.
 */
const getAllEnrollments = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const { studentId, courseId } = req.query;

    const effectiveStudentId = isAdmin ? studentId : req.ownStudentId;

    // A non-admin with no linked student profile owns nothing — return an
    // empty list rather than accidentally falling through to "no filter"
    // (which would mean "show me everyone").
    if (!isAdmin && !effectiveStudentId) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const enrollments = await enrollmentModel.getAll({ studentId: effectiveStudentId, courseId });
    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/enrollments — requires `authenticate` + `attachOwnStudent`.
 * Ownership-based authorization: a regular user may only enroll *themselves*
 * (studentId must match their own linked student profile). Admins may
 * enroll any student, e.g. to manage the roster on someone's behalf.
 */
const createEnrollment = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.body;
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && req.ownStudentId !== studentId) {
      throw new ApiError(403, "You can only enroll yourself in a course.");
    }

    const [student, course] = await Promise.all([
      studentModel.getById(studentId),
      courseModel.getById(courseId),
    ]);
    if (!student) throw new ApiError(404, `Student with id ${studentId} not found`);
    if (!course) throw new ApiError(404, `Course with id ${courseId} not found`);

    const enrollment = await enrollmentModel.create({ studentId, courseId });
    if (!enrollment) throw new ApiError(400, "This student is already enrolled in this course");

    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
};

/**
 * @route DELETE /api/enrollments/:id — requires `authenticate` + `attachOwnStudent`.
 * Ownership-based authorization: a regular user may only remove their own
 * enrollment; admins may remove anyone's.
 */
const deleteEnrollment = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";

    const enrollment = await enrollmentModel.getById(req.params.id);
    if (!enrollment) throw new ApiError(404, `Enrollment with id ${req.params.id} not found`);

    if (!isAdmin && req.ownStudentId !== enrollment.student_id) {
      throw new ApiError(403, "You can only remove your own enrollments.");
    }

    await enrollmentModel.remove(req.params.id);
    res.status(200).json({ success: true, message: `Enrollment with id ${req.params.id} deleted successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllEnrollments, createEnrollment, deleteEnrollment };
