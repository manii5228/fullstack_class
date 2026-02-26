const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "vtu24573",
  database: "student_db"
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed");
    console.log(err);
  } else {
    console.log("Database connected");
  }
});

// REGISTER API (INSERT DATA)
app.post("/register", (req, res) => {
  const { name, email, dob, department, phone } = req.body;

  const sql = "INSERT INTO students (name, email, dob, department, phone) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [name, email, dob, department, phone], (err, result) => {
    if (err) {
      console.log(err);
      res.json({ message: "Error inserting data" });
    } else {
      res.json({ message: "Student Registered Successfully" });
    }
  });
});

// GET ALL STUDENTS (SELECT)
app.get("/students", (req, res) => {
  const sql = "SELECT * FROM students";

  db.query(sql, (err, result) => {
    if (err) {
      res.json({ message: "Error fetching data" });
    } else {
      res.json(result);
    }
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});