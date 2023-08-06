const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

const items = ["buy food", "go for run", "healthy eat", "then repeat"];
const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your ToDo List!"
});
const item2 = new Item({
    name: "Hit the + button to add a new item."
});
const item3 = new Item({
    name: "<-- Hit this to delete the item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = new mongoose.model("List", listSchema);

app.get("/", (req, res) => {

    let dayObj = date.getDate();
    let day = dayObj.nameOfTheday;
    let salutationMsg = dayObj.message;
    Item.find({}).then(function (foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems)
                .then(function () {
                    console.log("Successfully saved into our DB.");
                })
                .catch(function (err) {
                    console.log(err);
                });
            res.redirect("/");
        } else {
            res.render("list", { listTitle: day, newListItems: foundItems, msg: salutationMsg });
        }
    })
});

app.post("/", (req, res) => {

    let dayObj = date.getDate();
    let day = dayObj.nameOfTheday;

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === day) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName})
        .then((foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
        .catch((err) => {console.log(err);});
    }


    // if (req.body.addButton == 'Work') {
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else {
    //     items.push(item);
    //     res.redirect("/");
    // }
});

app.post("/delete", (req, res) => {
    let dayObj = date.getDate();
    let day = dayObj.nameOfTheday;

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === day) {
        Item.findByIdAndRemove(checkedItemId)
            .then(() => console.log(`Deleted ${checkedItemId} Successfully`))
            .catch((err) => console.log("Deletion Error: " + err));
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
        .then((foundList) => {  res.redirect("/" + listName);  })
        .catch((err) => console.log("Deletion Error: " + err));
    }

});

// app.get("/work", (req, res) => {
//     let dayObj = date.getDate();
//     let salutationMsg = dayObj.message;
//     res.render("list", { listTitle: "Work List", newListItems: workItems, msg: salutationMsg });
// });

app.get("/:customListName", (req, res) => {
    let dayObj = date.getDate();
    let salutationMsg = dayObj.message;

    let customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName })
        .then((foundList) => {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items, msg: salutationMsg });
            }
        })
        .catch((err) => {
            console.log(err);
        });

})

app.get("/about", (req, res) => {
    res.render("about");
});

// app.post("/newToDo", (req, res) => {
//     items = [];
//     res.redirect("/");
// });

var listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Server started at", listener.address().port);
});
