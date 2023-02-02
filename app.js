const express = require("express");
const path = require("path");
const mysql2 = require("mysql2");
const multer = require("multer");
const { diskStorage } = require("multer");

const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage });

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
  else {
    console.log("connected to db successfully");
  }
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

let image;

app.post("/signup", upload.single("profile_pic"), (req, res, next) => {
  console.log(req.body);

  let password = req.body.pwd;
  let uname = req.body.uname;
  image = req.file.filename;
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
    `SELECT * FROM users WHERE email = ?`,
    [email],
    async (err, result) => {
      if (err) console.log("err found:", err);
      // console.log(result[0].image.toString());

      image = path.join("images", "uploads", result[0].image.toString());
      let id = result[0].id;

      console.log(image);
      res.render("user.ejs", { password, uname, email,id, image });
    }
  );
});

app.get("/login", (req, res) => {
  res.render("login_page");
});

app.post("/login_post", (req, res) => {
  console.log(req.body);

  let uname = req.body.username;
  let password = req.body.pwd;

  let sql = `SELECT * FROM users WHERE username = ? AND password = ? `;

  connection.query(sql, [uname, password], async (err, result) => {
    if (err) console.log(err);

    console.log(result);
    let id = await result[0].id;

    console.log("the id is," + id);

    if (result == "") {
      return res.status(402).render("login_page");
    } else {
      let email = result[0].email;
      let image = path.join("images", "uploads", result[0].image.toString());
      res.render("user", { password, uname, email, image,id });
    }
  });
});

app.post('/update_user/:id', (req, res) => {
  let id = req.params.id
  console.log(id);

  console.log(req.body);
  let uname = req.body.uname
  let password = req.body.pwd
  let email = req.body.email
  let image = req.body.image

  let sql = `UPDATE users SET username = ?,email = ?,password = ? WHERE id = ?`

  connection.query(sql, [uname, email, password, id], (err, result) => {
    if (err) console.log('error found:', err);
    
    req.url = ``
    res.redirect(`http://localhost:${PORT}/login`)
  })
})

app.get('/deleteaccount/:id', (req, res) => {

  let id = req.params.id
  let sql = `DELETE FROM users WHERE id = ?`
  connection.query(sql, [id], (err, result) => {
    if (err) console.log(err);
    res.redirect('/')
  })
})

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
