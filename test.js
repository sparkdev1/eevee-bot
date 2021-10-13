async function teste(id) {
    return requestPromise(`https://api.jikan.moe/v3/character/${id}/pictures`).then(response => {
        if (response.statusCode === 200) {
            return JSON.parse(response.body)
        }
        return Promise.reject(response.statusCode)
    })
}