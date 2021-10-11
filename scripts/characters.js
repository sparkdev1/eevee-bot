const anilist = require('anilist-node');
const Anilist = new anilist();

const getRandomCharacter = (min, max) => {
    return Math.ceil(Math.random() * (max - min) + min);
}

const getCharFromMAL = async() => {
    const drop = []
    await Anilist.people.character(getRandomCharacter(1, 200)).then(data => {
        drop.push(({ 'name': data.name.english, 'image': data.image.large, 'animeTitle': data.media['0'].title.english }))
    })

    await Anilist.people.character(getRandomCharacter(1, 200)).then(data => {
        drop.push({ 'name': data.name.english, 'image': data.image.large, 'animeTitle': data.media['0'].title.english })
    })

    await Anilist.people.character(getRandomCharacter(1, 200)).then(data => {
        drop.push({ 'name': data.name.english, 'image': data.image.large, 'animeTitle': data.media['0'].title.english })
    })

    return drop
}

module.exports.getCharFromMAL = getCharFromMAL;