import anilist from 'anilist-node';
const Anilist = new anilist();
import fetch from 'node-fetch'
import request from 'request'
import util from 'util'
const requestPromise = util.promisify(request);

//Anilist.media.anime(21708).then(data => {
//     console.log(data);
// });

var drop = [];

export async function getChars() {
    function random(min, max) {
        return Math.ceil(Math.random() * (max - min) + min);
    }
    var randomInt = random(1, 3000)

    var query = `
    query ($randomInt: Int){
        Page (page: $randomInt, perPage: 1) {
        pageInfo {
            total
        }
        media(type: ANIME, sort: FAVOURITES_DESC) {
            title {
                romaji
            }
            characters (sort: ID){
                edges{
                    node {
                        id
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
    async function teste(id) {
        return requestPromise(`https://api.jikan.moe/v3/character/${id}/pictures`).then(response => {
            if (response.statusCode === 200) {
                return JSON.parse(response.body)
            }
            return Promise.reject(response.statusCode)
        })
    }

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
        var number = random(0, data.data.Page.media[0].characters.edges.length - 1)
        var char = data.data.Page.media[0].characters.edges[number].node.name
        var title = data.data.Page.media[0].title.romaji
        var img = data.data.Page.media[0].characters.edges[number].node.image.large
        var id = data.data.Page.media[0].characters.edges[number].node.id
        return drop.push({
            char,
            title,
            img,
            id
        })

    }

    function handleError(error) {
        console.error(error);
    }
}

await getChars()
await getChars()
await getChars()

console.log(drop)