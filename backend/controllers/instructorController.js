const instructorModel = require("../models/instructorModel");
const ApiError = require("../middleware/ApiError");

const getAllInstructors = async (req, res, next) => {
  try {
    const instructors = await instructorModel.getAll();
    res.status(200).json({ success: true, count: instructors.length, data: instructors });
  } catch (err) {
    next(err);
  }
};

const getInstructorById = async (req, res, next) => {
  try {
    const instructor = await instructorModel.getById(req.params.id);
    if (!instructor) throw new ApiError(404, `Instructor with id ${req.params.id} not found`);
    res.status(200).json({ success: true, data: instructor });
  } catch (err) {
    next(err);
  }
};

const createInstructor = async (req, res, next) => {
  try {
    const existing = await instructorModel.getByEmail(req.body.email);
    if (existing) throw new ApiError(400, `An instructor with email ${req.body.email} already exists`);

    const newInstructor = await instructorModel.create(req.body);
    res.status(201).json({ success: true, data: newInstructor });
  } catch (err) {
    next(err);
  }
};

const updateInstructor = async (req, res, next) => {
  try {
    const updated = await instructorModel.update(req.params.id, req.body);
    if (!updated) throw new ApiError(404, `Instructor with id ${req.params.id} not found`);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteInstructor = async (req, res, next) => {
  try {
    const deleted = await instructorModel.remove(req.params.id);
    if (!deleted) throw new ApiError(404, `Instructor with id ${req.params.id} not found`);
    res.status(200).json({ success: true, message: `Instructor with id ${req.params.id} deleted successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllInstructors, getInstructorById, createInstructor, updateInstructor, deleteInstructor };
