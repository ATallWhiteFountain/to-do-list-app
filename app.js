//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("css"));
mongoose.connect("mongodb://localhost:27017/todolist", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Get enough sleep."});
const item2 = new Item({name: "Get food and water."});
const item3 = new Item({name: "Get clean and fragrant."});
const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
    
    let formattedCurrentDate = date.getDate();    
    
    Item.find({}, (err, itemsFound) => {
        if(err) console.log("Query failed.");
        else {
            if(itemsFound.length === 0){
                Item.insertMany(defaultItems, (err) => {
                    if(err) console.log("Initial insertion failed.");
                    else console.log("Initial insertion success.");
                });
                res.redirect("/");
            }
            else res.render("list", {listTitle: formattedCurrentDate, taskList: itemsFound});
        }
    });
});

app.get("/work", (req, res) => {
    res.render("list", {listTitle: "Work List", taskList: workTasks});
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.post("/", (req, res) => {
    let itemName = req.body.newTask;
    const newItem = new Item({name: itemName});
    newItem.save();
    res.redirect("/");
});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId, (err, doc) => {
        if(err) console.log("Removing failed.");
        else {
            console.log("Removing succeeded");
            res.redirect("/");
        }
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running globally on different ports, locally 3000.");
});