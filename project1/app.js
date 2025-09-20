import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = 5000;
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({extended : true}));

app.get("/", (req, res) => {
  res.send("Hello Priyanshu Chaniyara");
});
app.get("/home", (req, res) => {
  res.sendFile(join(__dirname, "home.html"));
});
app.get("/about", (req, res) => {
  res.sendFile(join(__dirname, "about.html"));
});
app.get("/contact", (req, res) => {
  res.sendFile(join(__dirname, "contact.html"));
});

// http://localhost:5000/product/mobiles/123
app.get("/product/:id/:id1", (req, res) => {
  var id = req.params.id;
  var id1 = req.params.id1;
  res.send(`Product ID: ${id}, Additional ID: ${id1}`);
});

// http://localhost:5000/search?q=iphone
app.get("/search/", (req, res) => {
  var qq = req.query.q;
  res.send(`Query Searching value is ${qq}`);
});

app.get("/sum", (req, res) => {
  const a = parseInt(req.query.a);
  const b = parseInt(req.query.b);
  if (isNaN(a) || isNaN(b)) {
    return res.status(400).send("Invalid input");
  }
  const sum = a + b;
  res.send(`Value of a is ${a} and value of b is ${b} and Sum is ${sum}`);
});

app.get("/sumform", (req, res) => {
  res.sendFile(join(__dirname, "public", "sum.html"));
});

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/homepage", (req, res) => {
  res.render("home", { mya: "Priyanshu" });
});

app.get("/marksheet", (req, res) => {
  res.render("marksheet");
});

app.post("/marksheetprocess", (req, res) => {
  var a = parseInt(req.body.txt1);
  var b = parseInt(req.body.txt2);

  var c = a + b;
  res.render("ans", { mya: a, myb: b, myc: c });
});

console.log(`Server listed on http://localhost:${port}`);

app.listen(port);
