const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
    userID: String,
    itemID: String,
    type: String,
    name: String,
    photo: String
})

module.exports = mongoose.model("Item", dataSchema);