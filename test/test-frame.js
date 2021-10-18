const { createCanvas, loadImage, registerFont } = require('canvas')
async function teste(id) {
    return requestPromise(`https://api.jikan.moe/v3/character/${id}/pictures`).then(response => {
        if (response.statusCode === 200) {
            return JSON.parse(response.body)
        }
        return Promise.reject(response.statusCode)
    })
}

const createDropTemplate = async () => {
    const canvas = createCanvas(270, 380)
    registerFont('./custom-fonts/PublicSans-Regular.otf', { family: 'Public Sans' })
    const ctx = canvas.getContext('2d')

    
    ctx.drawImage(await loadImage('images/try.png'), 15, 90, 230, 345)
    //ctx.drawImage(await loadImage('images/381.png'), null, null, 270, 400)

    ctx.font = '40px Public Sans'
    ctx.fillStyle = "#000000";

    ctx.fillText('Aya Maruyama', 30, 80, 200)

    ctx.fillText('BanG Dream!', 35, 345, 200)

    const fs = require('fs')
    const out = fs.createWriteStream(__dirname + '/test2.png')
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () => console.log('The Drop PNG file was created.'))

}

createDropTemplate()