const express = require("express");
const path = require("path");
const mysql2 = require("mysql2");
const multer = require("multer");
const { diskStorage } = require("multer");

const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null,'public/images/uploads')
  },
  filename: function (req, file, cb) {
    cb(null,originalname)
  }
})

const upload = multer({ storage })

const app = express();
const PORT = process.env.PORT || 8080;

// setup mysql server

const connection = mysql2.createConnection({
  host: "localhost",
  database: "brainiacs",
  user: "root",
  password: "",
});

connection.connect((err) => {
  if (err) console.log("error found," + err);
  console.log("connected to db successfully");
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index.ejs");
});


app.post("/user", (req, res) => {
  console.log(req.body);

  let password = req.body.pwd;
  let uname = req.body.uname;
  let image = req.body.profile_pic;
  let email = req.body.email;

  connection.query(
    `INSERT INTO users (email,username,password,image) VALUES (?,?,?,?)`,
    [email, uname, password, image],
    (err, result) => {
      if (err) console.log("err found:", err);
      console.log("data entered successfully!");
    }
  );

  connection.query(
    `SELECT image FROM users WHERE email = ?`,
    [email],
    (err, result) => {
      if (err) console.log("err found:", err);
      console.log(result[0].image.toString());
    }
  );

  res.render("user.ejs", { password, uname, email, image });
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
