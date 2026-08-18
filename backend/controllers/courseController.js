const courseModel = require("../models/courseModel");
const instructorModel = require("../models/instructorModel");
const ApiError = require("../middleware/ApiError");

/** @route GET /api/courses — list courses (supports ?search=&category=&level=&page=&limit=) */
const getAllCourses = async (req, res, next) => {
  try {
    const { search, category, level, page, limit } = req.query;
    const result = await courseModel.getAll({ search, category, level, page, limit });

    res.status(200).json({
      success: true,
      count: result.data.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit) || 1,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

/** @route GET /api/courses/:id */
const getCourseById = async (req, res, next) => {
  try {
    const course = await courseModel.getById(req.params.id);
    if (!course) throw new ApiError(404, `Course with id ${req.params.id} not found`);
    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

/** @route POST /api/courses */
const createCourse = async (req, res, next) => {
  try {
    if (req.body.instructorId !== undefined && req.body.instructorId !== null) {
      const instructor = await instructorModel.getById(req.body.instructorId);
      if (!instructor) throw new ApiError(400, `instructorId ${req.body.instructorId} does not refer to an existing instructor`);
    }

    const newCourse = await courseModel.create(req.body);
    res.status(201).json({ success: true, data: newCourse });
  } catch (err) {
    next(err);
  }
};

/** @route PUT /api/courses/:id */
const updateCourse = async (req, res, next) => {
  try {
    if (req.body.instructorId !== undefined && req.body.instructorId !== null) {
      const instructor = await instructorModel.getById(req.body.instructorId);
      if (!instructor) throw new ApiError(400, `instructorId ${req.body.instructorId} does not refer to an existing instructor`);
    }

    const updatedCourse = await courseModel.update(req.params.id, req.body);
    if (!updatedCourse) throw new ApiError(404, `Course with id ${req.params.id} not found`);
    res.status(200).json({ success: true, data: updatedCourse });
  } catch (err) {
    next(err);
  }
};

/** @route DELETE /api/courses/:id */
const deleteCourse = async (req, res, next) => {
  try {
    const deleted = await courseModel.remove(req.params.id);
    if (!deleted) throw new ApiError(404, `Course with id ${req.params.id} not found`);
    res.status(200).json({ success: true, message: `Course with id ${req.params.id} deleted successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
