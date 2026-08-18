const studentModel = require("../models/studentModel");

/**
 * Must run after `authenticate`. Looks up the student profile linked to the
 * logged-in user (req.user.id) and attaches its id as req.ownStudentId.
 *
 * req.ownStudentId is `null` when the user has no linked student profile
 * (e.g. an admin, or a student account created before a profile was
 * attached) — controllers treat that as "owns nothing" rather than erroring,
 * since not every authenticated user needs to own a student record.
 */
const attachOwnStudent = async (req, res, next) => {
  try {
    if (req.user) {
      const student = await studentModel.findByUserId(req.user.id);
      req.ownStudentId = student ? student.id : null;
    } else {
      req.ownStudentId = null;
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { attachOwnStudent };
