const express = require("express");
const connectDB = require("./src/db/mongoose");

const app = express();

// Connect to database
connectDB();

app.get("/", (req, res) => {
  res.send("Api running");
});

// middleware
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname+"/Imagi1"));

// Define routes
//app.use("/api/users", require("./src/routers/api/users"));
var users = require("./src/routers/api/users.js");
app.use("/",users);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server is started on port", PORT);
});
