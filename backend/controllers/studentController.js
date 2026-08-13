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

const createStudent = async (req, res, next) => {
  try {
    const newStudent = await studentModel.create(req.body);
    res.status(201).json({ success: true, data: newStudent });
  } catch (err) {
    if (err.code === "23505") return next(new ApiError(400, `A student with email ${req.body.email} already exists`));
    next(err);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const updated = await studentModel.update(req.params.id, req.body);
    if (!updated) throw new ApiError(404, `Student with id ${req.params.id} not found`);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    if (err.code === "23505") return next(new ApiError(400, `A student with email ${req.body.email} already exists`));
    next(err);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const deleted = await studentModel.remove(req.params.id);
    if (!deleted) throw new ApiError(404, `Student with id ${req.params.id} not found`);
    res.status(200).json({ success: true, message: `Student with id ${req.params.id} deleted successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent };
