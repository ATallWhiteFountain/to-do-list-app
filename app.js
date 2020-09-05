//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("css"));
mongoose.connect("mongodb://localhost:27017/todolist", 
    {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Get enough sleep."});
const item2 = new Item({name: "Get food and water."});
const item3 = new Item({name: "Get clean and fragrant."});
const defaultItems = [item1, item2, item3];

// for custom lists accessed through dynamic url parameters
const customListSchema = new mongoose.Schema({
   name: String,
   items: [itemsSchema] 
});
const CustomList = mongoose.model("List", customListSchema);

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

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    CustomList.findOne({name: customListName}, (err, customListFound) => {
        if(err) console.log("Failed to perform finding custom list");
        else {
            if(!customListFound) {
                const customList = new CustomList({
                    name: customListName,
                    items: defaultItems
                });
                customList.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {listTitle: customListFound.name, taskList: customListFound.items});
            }
        }
    });
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.post("/", (req, res) => {
    const itemName = req.body.newTask;
    const listTitle = req.body.list;

    const newItem = new Item({name: itemName});

    if (listTitle === date.getDate().split(" ")[0]) {
        newItem.save();
        res.redirect("/");
    } else {
        CustomList.findOne({name: listTitle}, (err, doc) => {
            if(err) console.log("Failed to push item onto list");
            else {
                if(!doc) console.log("List not found");
                else {
                    doc.items.push(newItem);
                    doc.save();
                    res.redirect("/" + listTitle);
                }
            }
        });
    }
});

app.post("/delete", (req, res) => {
    const listName  = req.body.listName;
    const checkedItemId = req.body.checkbox;

    if(listName === date.getDate()) {
        Item.findByIdAndRemove(checkedItemId, (err, doc) => {
            if(err) console.log("Removing failed.");
            else {
                console.log("Removing succeeded");
                res.redirect("/");
            }
        });
    } else {
        CustomList.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, doc) => {
            if(err) console.log("Removing from custom list failed");
            else {
                console.log("Removing succeeded");
                res.redirect("/" + listName);
            }
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running globally on different ports, locally 3000.");
});