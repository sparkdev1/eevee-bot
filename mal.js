const anilist = require('anilist-node');
const Anilist = new anilist();

//Anilist.media.anime(21708).then(data => {
//     console.log(data);
// });
function getRandomCharacter(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
  }


  
let characterID = getRandomCharacter(1,50000);
var drop = []
Anilist.people.character(73935).then(data => {
    drop.push({'name': data.name.english, 'image': data.image.large, 'animeTitle': data.media['0'].title.english});
    
    Anilist.people.character(17).then(data2 => {
        drop.push({'name': data2.name.english, 'image': data2.image.large, 'animeTitle': data2.media['0'].title.english});

        Anilist.people.character(126071).then(data3 => {
            drop.push({'name': data3.name.english, 'image': data3.image.large, 'animeTitle': data3.media['0'].title.english});
            console.log(drop)
        }) 
    })
})

