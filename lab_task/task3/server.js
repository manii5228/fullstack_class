const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "vtu24573",
    database: "login_system"
});

db.connect(err => {
    if (err) {
        console.log("Database connection failed");
    } else {
        console.log("Database connected");
    }
});

// LOGIN API
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";

    db.query(sql, [username, password], (err, result) => {
        if (result.length > 0) {
            res.json({ success: true, message: "Login Successful" });
        } else {
            res.json({ success: false, message: "Invalid Username or Password" });
        }
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});