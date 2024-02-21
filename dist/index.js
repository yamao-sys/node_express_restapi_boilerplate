"use strict"
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, "__esModule", { value: true })
const express_1 = __importDefault(require("express"))
const path_1 = __importDefault(require("path"))
const app = (0, express_1.default)()
app.use(express_1.default.json())
app.use(
  express_1.default.urlencoded({
    extended: true,
  }),
)
app.use(express_1.default.static(path_1.default.join(__dirname, "public")))
app.post("/api/v1/quiz", function (req, res) {
  const answer = req.body.answer
  if (answer === "2") {
    res.redirect("/correct.html")
  } else {
    res.redirect("/incorrect.html")
  }
})
app.get("/", function (req, res) {
  res.send("Hello World")
})
app.get("/about", function (req, res) {
  res.send("about page")
})
app.listen(1234, function () {
  console.log("server running")
})
