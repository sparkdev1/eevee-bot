const anilist = require('anilist-node');
const Anilist = new anilist();
const char = require('./scripts/characters.js')
const card = require('./scripts/cards.js')

const getCharacter = async () => {
    const test = await char.getCharFromMAL()

    console.log(await card.createDropTemplate(test))
}

getCharacter()