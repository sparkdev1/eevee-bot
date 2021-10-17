const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
    name: String,
    userID: String,
    lb: String,
    money: String,
    star: String,
    daily: String
})

module.exports = mongoose.model("Data", dataSchema);