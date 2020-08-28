//jshint esversion:6

const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("css"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const date = require(__dirname + "/date.js");

const tasks = [];
const workTasks = [];

app.get("/", (req, res) => {
    let formattedCurrentDate = date.getDate();    
    res.render("list", {listTitle: formattedCurrentDate, taskList: tasks});
});

app.get("/work", (req, res) => {
    res.render("list", {listTitle: "Work List", taskList: workTasks});
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.post("/", (req, res) => {
    let task = req.body.newTask;
    if (req.body.list === "Work") {
        workTasks.push(task);
        res.redirect("/work");
    } else {
        tasks.push(task);
        res.redirect("/");
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running globally on different ports, locally 3000.");
});