const enrollmentModel = require("../models/enrollmentModel");
const studentModel = require("../models/studentModel");
const courseModel = require("../models/courseModel");
const ApiError = require("../middleware/ApiError");

const getAllEnrollments = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.query;
    const enrollments = await enrollmentModel.getAll({ studentId, courseId });
    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) {
    next(err);
  }
};

const createEnrollment = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.body;

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

const deleteEnrollment = async (req, res, next) => {
  try {
    const deleted = await enrollmentModel.remove(req.params.id);
    if (!deleted) throw new ApiError(404, `Enrollment with id ${req.params.id} not found`);
    res.status(200).json({ success: true, message: `Enrollment with id ${req.params.id} deleted successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllEnrollments, createEnrollment, deleteEnrollment };
