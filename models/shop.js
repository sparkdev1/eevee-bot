const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
    itemID: String,
    type: String,
    price: String,
    name: String,
    photo: String
})

module.exports = mongoose.model("Shop", dataSchema);