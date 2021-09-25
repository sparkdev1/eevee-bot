const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
    userID: String,
    cardID: String,
    cardName: String,
    cardStars: String,
    cardAttack: String,
    cardDefense: String,
    cardIntelligence: String,
    cardDateGet: String,
    cardPhoto: String,
})

module.exports = mongoose.model("Card", dataSchema);