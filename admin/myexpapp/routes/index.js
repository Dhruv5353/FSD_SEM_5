var express = require("express");
var router = express.Router();
const Student = require("../models/Student");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/home", function (req, res, next) {
  res.render("home", { title: "Home Page" });
});

router.get("/about", function (req, res, next) {
  res.render("about", { title: "About Us" });
});

router.get("/add-student", function (req, res, next) {
  res.render("add-student");
});

router.post("/add-student-process", function (req, res, next) {
  const { name, mobile, email } = req.body;
  const newStudent = new Student({
    name,
    mobile,
    email,
  });
  newStudent.save().then(() => {
    res.send("Data added Successfully!");
  });
});


router.get('/display-student', async function(req, res, next) {
  const students = await Student.find();
  res.render('display-student', {
    title: 'Student List',
    students: students
  });
});
module.exports = router;
