const mongoose = require("mongoose");

const fsLibrary  = require('fs')
 
const id = async function () {
    var id;
    fsLibrary.readFile('./models/id.txt', (error, txtString) => {
 
        if (error) throw error;
        incrementID(txtString.toString())
        id = (txtString.toString())
    })
    console.log(`current id ${id}`)
    return id
}

const incrementID = async function (number) {
    let newID = parseInt(number) + 1
    fsLibrary.writeFile('./models/id.txt', newID.toString(), (error) => {
        if (error) throw err;
    })
}

const dataSchema = mongoose.Schema({
    userID: String,
    cardID: Number,
    cardName: String,
    cardFrom: String,
    cardStars: String,
    cardAttack: String,
    cardDefense: String,
    cardIntelligence: String,
    cardDateGet: String,
    cardPhoto: String,
})

module.exports = mongoose.model("Card", dataSchema);
module.exports.incrementID = incrementID