const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(1900, 1000)
const ctx = canvas.getContext('2d')

// Draw cat with lime helmet
loadImage('images/background2.jpg').then((background) => {
    
    ctx.drawImage(background, 50, 100, 500, 800)

        loadImage('https://s4.anilist.co/file/anilistcdn/character/large/b73935-bBEu127IYhci.jpg').then((background)=> {ctx.drawImage(background, null, null, 1700, 1000)
    
        loadImage('https://s4.anilist.co/file/anilistcdn/character/large/b17-IazKGogQwJ1p.png').then((character2)=>{ctx.drawImage(character2, 600, 100, 500, 800)
    
        loadImage('https://s4.anilist.co/file/anilistcdn/character/large/b126071-BTNEc1nRIv68.png').then((character3)=>{ctx.drawImage(character3, 1150, 100, 500, 800)

    ctx.font = '60px Impact'
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText('Saitama', 100, 80, 400)
    ctx.fillText('Naruto', 650, 80, 400)
    ctx.fillText('Tanjirou Kamado', 1200, 80, 400)
    ctx.fillText('One-Punch Man', 100, 980, 400)
    ctx.fillText('Naruto', 650, 980, 400)
    ctx.fillText('Demon Slayer: Kimetsu no Yaiba', 1200, 980, 400)
    
    const fs = require('fs')
    const out = fs.createWriteStream(__dirname + '/drop.png')
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () =>  console.log('The Drop PNG file was created.'))

        })})})
})

