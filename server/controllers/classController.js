import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Class } from "../models/classModel.js";
import crypto from "crypto";

// Helper to generate a 6-character alphanumeric code
const generateJoinCode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

export const createClass = catchAsyncError(async (req, res, next) => {
  const { name, year, branch, semester, section } = req.body;

  if (!name || !year || !branch || !semester || !section) {
    return next(new ErrorHandler("Please provide all required fields.", 400));
  }

  let joinCode = generateJoinCode();
  // Ensure uniqueness
  let isUnique = false;
  while (!isUnique) {
    const existingClass = await Class.findOne({ joinCode });
    if (!existingClass) {
      isUnique = true;
    } else {
      joinCode = generateJoinCode();
    }
  }

  const newClass = await Class.create({
    teacher: req.user._id,
    name,
    year,
    branch,
    semester,
    section,
    joinCode,
  });

  res.status(201).json({
    success: true,
    message: "Class created successfully.",
    newClass,
  });
});

export const getClasses = catchAsyncError(async (req, res, next) => {
  let classes = [];

  if (req.user.role === "Teacher" || req.user.role === "Admin") {
    // Teachers see classes they created
    classes = await Class.find({ teacher: req.user._id })
      .populate("teacher", "name email")
      .populate("students", "name email");
  } else {
    // Students see classes they are enrolled in
    classes = await Class.find({ students: req.user._id })
      .populate("teacher", "name email");
  }

  res.status(200).json({
    success: true,
    classes,
  });
});

export const getClassDetails = catchAsyncError(async (req, res, next) => {
  const classId = req.params.id;

  const classDetails = await Class.findById(classId)
    .populate("teacher", "name email")
    .populate("students", "name email");

  if (!classDetails) {
    return next(new ErrorHandler("Class not found.", 404));
  }

  // Authorization check
  const isTeacher = classDetails.teacher._id.toString() === req.user._id.toString();
  const isStudent = classDetails.students.some(
    (student) => student._id.toString() === req.user._id.toString()
  );

  if (!isTeacher && !isStudent && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to view this class.", 403));
  }

  res.status(200).json({
    success: true,
    classDetails,
  });
});

export const toggleJoinStatus = catchAsyncError(async (req, res, next) => {
  const classId = req.params.id;

  const classDetails = await Class.findById(classId);

  if (!classDetails) {
    return next(new ErrorHandler("Class not found.", 404));
  }

  if (classDetails.teacher.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to modify this class.", 403));
  }

  classDetails.joiningOpen = !classDetails.joiningOpen;
  await classDetails.save();

  res.status(200).json({
    success: true,
    message: `Class joining is now ${classDetails.joiningOpen ? "open" : "closed"}.`,
    classDetails,
  });
});

export const joinClass = catchAsyncError(async (req, res, next) => {
  const { joinCode } = req.body;

  if (!joinCode) {
    return next(new ErrorHandler("Please provide a join code.", 400));
  }

  const classDetails = await Class.findOne({ joinCode });

  if (!classDetails) {
    return next(new ErrorHandler("Invalid join code.", 404));
  }

  if (!classDetails.joiningOpen) {
    return next(new ErrorHandler("Joining is currently closed for this class.", 403));
  }

  if (classDetails.students.includes(req.user._id)) {
    return next(new ErrorHandler("You are already enrolled in this class.", 400));
  }

  classDetails.students.push(req.user._id);
  await classDetails.save();

  res.status(200).json({
    success: true,
    message: "Successfully joined the class.",
    classDetails,
  });
});

export const removeStudent = catchAsyncError(async (req, res, next) => {
  const { classId, studentId } = req.params;

  const classDetails = await Class.findById(classId);

  if (!classDetails) {
    return next(new ErrorHandler("Class not found.", 404));
  }

  if (classDetails.teacher.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to modify this class.", 403));
  }

  if (!classDetails.students.includes(studentId)) {
    return next(new ErrorHandler("Student is not in this class.", 400));
  }

  classDetails.students = classDetails.students.filter(
    (id) => id.toString() !== studentId.toString()
  );
  await classDetails.save();

  res.status(200).json({
    success: true,
    message: "Student removed successfully.",
  });
});
