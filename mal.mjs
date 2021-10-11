import request from 'request'
import anilist from 'anilist-node';
const Anilist = new anilist();
import fetch from 'node-fetch'
//Anilist.media.anime(21708).then(data => {
    //     console.log(data);
    // });
    function getRandomCharacter(min, max) {
        return Math.ceil(Math.random() * (max - min) + min);
    }

var dropInfo = []

async function getFROMAPI() {
    var randomInt = getRandomCharacter(1, 1000)

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


    await fetch(url, options).then(await handleResponse)
    .then(await handleData)

    function handleResponse(response) {
        return response.json().then(function(json) {
            return response.ok ? json : Promise.reject(json);
        });
    }

    async function handleData(data) {

        var Char = data.data.Page.media[0].characters.edges[getRandomCharacter(0, data.data.Page.media[0].characters.edges.length - 1)];
        var Title = data.data.Page.media[0].title;
        request(`https://api.jikan.moe/v3/character/${Char.node.id}/pictures`, async function (error, response, body) {
            var Pics = JSON.parse(body).pictures[getRandomCharacter(0, JSON.parse(body).pictures.length - 1)];
            dropInfo.push(Pics)
            dropInfo.push(Title)
            dropInfo.push(Char)
            return dropInfo
        })
        return dropInfo
    }
    return dropInfo
}

 console.log(await getFROMAPI())
 console.log(await getFROMAPI())
 console.log(await getFROMAPI())
