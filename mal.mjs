import anilist from 'anilist-node';
const Anilist = new anilist();
import fetch from 'node-fetch'
//Anilist.media.anime(21708).then(data => {
//     console.log(data);
// });
function getRandomCharacter(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
}
var randomInt = 4;



// let characterID = getRandomCharacter(1,50000);
// var drop = []
// Anilist.people.character(73935).then(data => {
//     drop.push({'name': data.name.english, 'image': data.image.large, 'animeTitle': data.media['0'].title.english});

//     Anilist.people.character(17).then(data2 => {
//         drop.push({'name': data2.name.english, 'image': data2.image.large, 'animeTitle': data2.media['0'].title.english});

//         Anilist.people.character(126071).then(data3 => {
//             drop.push({'name': data3.name.english, 'image': data3.image.large, 'animeTitle': data3.media['0'].title.english});
//             console.log(drop)
//         }) 
//     })
// })

// Here we define our query as a multi-line string
// Storing it in a separate .graphql/.gql file is also possible
var randomInt = getRandomCharacter(1, 200)

var query = `
query ($randomInt: Int){
    Page (page: $randomInt, perPage: 1) {
      pageInfo {
        total
      }
      media(type: ANIME, sort: FAVOURITES) {
        title {
            romaji
        }
        characters (sort: ID){
            edges{
                node {
                    name {
                        first
                        last
                    }
                    image {
                        large
                    }
                }
            }
        }
      }
    }
  }
`;

// Define our query variables and values that will be used in the query request

var variables = {
        randomInt: randomInt
    }
    // Define the config we'll need for our Api request
var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };


// Make the HTTP Api request
await fetch(url, options).then(handleResponse)
    .then(handleData)
    .catch(handleError);


function handleResponse(response) {
    return response.json().then(function(json) {
        return response.ok ? json : Promise.reject(json);
    });
}

async function handleData(data) {
    data.data.Page.media[0].characters.edges.forEach(element => {
        console.log(element)
    });
    await console.log(data.data.Page.media[0].title)
    console.log(data.data.Page.media)
}

function handleError(error) {
    console.error(error);
}