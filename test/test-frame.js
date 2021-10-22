const { createCanvas, loadImage, registerFont } = require('canvas')
async function lookPics(id) {
    return requestPromise(`https://api.jikan.moe/v3/character/${id}/pictures`).then(response => {
        if (response.statusCode === 200) {
            return JSON.parse(response.body)
        }
        return Promise.reject(response.statusCode)
    })
}

function random(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
}

async function findMalId(charName) {
    return requestPromise(`https://api.jikan.moe/v3/character/${id}/pictures`).then(response => {
        if (response.statusCode === 200) {
            return JSON.parse(response.body)
        }
        return Promise.reject(response.statusCode)
    })
}

const cardFrame = async (cardName, cardFrom, cardPhoto, itemPhoto) => {

    const width = 274;
    const height = 405;
  
    const canvas = createCanvas(width, height)
    registerFont('./custom-fonts/Amaranth-Bold.ttf', { family: 'Amaranth' })
    const ctx = canvas.getContext('2d')
  
    
    
    ctx.drawImage(await loadImage(itemPhoto), null, null, 270, 400)
   
    ctx.font = 'Amaranth'
    ctx.fillStyle = "#000000";
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle';
  
  
    drawMultilineText(
        ctx,
        `${cardName}`,
        {
            rect: {
                x: 137,
                y: 40,
                width: 200,
                height: 50
            },
            font: 'Amaranth',
            verbose: true,
            lineHeight: 1,
            minFontSize: 25,
            maxFontSize: 36
        }
    )
    drawMultilineText(
        ctx,
        `${cardFrom}`,
        {
            rect: {
                x: 137,
                y: 300,
                width: 180,
                height: 50
            },
            font: 'Amaranth',
            verbose: true,
            lineHeight: 1,
            minFontSize: 22,
            maxFontSize: 36
        }
    )

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    invertColors(imageData.data, morph[random(1, morph.length - 1)])

    ctx.putImageData(imageData, 0, 0)
    
    const fs = require('fs')
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(__dirname + '/framedCard.png', buffer)
    return 
  
  }

  const cardMorph = async () => {

    const width = 274;
    const height = 405;
  
    const canvas = createCanvas(width, height)
    registerFont('./custom-fonts/Amaranth-Bold.ttf', { family: 'Amaranth' })
    const ctx = canvas.getContext('2d')
  
    
    ctx.drawImage(await loadImage('https://cdn.myanimelist.net/images/characters/4/356459.jpg'), 20, 90, 220, 290)
    ctx.drawImage(await loadImage('test/framedCard.png'), null, null, 270, 400)

    
    const fs = require('fs')
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(__dirname + '/card.png', buffer)
    return 

}



  function invertColors(data, morph = [0,204,251]) {
    for (var i = 0; i < data.length; i+= 4) {
      data[i] = data[i] + morph[0]; // Invert Red
      data[i+1] = data[i+1] + morph[1]; // Invert Green
      data[i+2] = data[i+2] + morph[2]; // Invert Blue
    }
  }




// const fontSizeUsed = drawMultilineText(
//     context,
//     "This is a text with multiple lines that is vertically centered as expected.",
//     {
//         rect: {
//             x: 1000,
//             y: 0,
//             width: 2000,
//             height: 2000
//         },
//         font: 'Arial',
//         verbose: true,
//         lineHeight: 1,
//         minFontSize: 100,
//         maxFontSize: 200
//     }
// )

// const buffer = canvas.toBuffer('image/png')
// fs.writeFileSync('./image3.png', buffer)

function drawMultilineText(ctx, text, opts) {

    // Default options
    if (!opts)
        opts = {}
    if (!opts.font)
        opts.font = 'sans-serif'
    if (typeof opts.stroke == 'undefined')
        opts.stroke = false
    if (typeof opts.verbose == 'undefined')
        opts.verbose = false
    if (!opts.rect)
        opts.rect = {
            x: 0,
            y: 0,
            width: ctx.canvas.width,
            height: ctx.canvas.height
        }
    if (!opts.lineHeight)
        opts.lineHeight = 1.1
    if (!opts.minFontSize)
        opts.minFontSize = 30
    if (!opts.maxFontSize)
        opts.maxFontSize = 100
    // Default log function is console.log - Note: if verbose il false, nothing will be logged anyway
    if (!opts.logFunction)
        opts.logFunction = function (message) { console.log(message) }


    const words = require('words-array')(text)
    if (opts.verbose) opts.logFunction('Text contains ' + words.length + ' words')
    var lines = []
    let y;  //New Line

    // Finds max font size  which can be used to print whole text in opts.rec

    
    let lastFittingLines;                       // declaring 4 new variables (addressing issue 3)
    let lastFittingFont;
    let lastFittingY;
    let lastFittingLineHeight;
    for (var fontSize = opts.minFontSize; fontSize <= opts.maxFontSize; fontSize++) {

        // Line height
        var lineHeight = fontSize * opts.lineHeight

        // Set font for testing with measureText()
        ctx.font = ' ' + fontSize + 'px ' + opts.font

        // Start
        var x = opts.rect.x;
        y = lineHeight; //modified line        // setting to lineHeight as opposed to fontSize (addressing issue 1)
        lines = []
        var line = ''

        // Cycles on words

       
        for (var word of words) {
            // Add next word to line
            var linePlus = line + word + ' '
            // If added word exceeds rect width...
            if (ctx.measureText(linePlus).width > (opts.rect.width)) {
                // ..."prints" (save) the line without last word
                lines.push({ text: line, x: x, y: y })
                // New line with ctx last word
                line = word + ' '
                y += lineHeight
            } else {
                // ...continues appending words
                line = linePlus
            }
        }

        // "Print" (save) last line
        lines.push({ text: line, x: x, y: y })

        // If bottom of rect is reached then breaks "fontSize" cycle
            
        if (y > opts.rect.height)                                           
            break;
            
        lastFittingLines = lines;               // using 4 new variables for 'step back' (issue 3)
        lastFittingFont = ctx.font;
        lastFittingY = y;
        lastFittingLineHeight = lineHeight;

    }

    lines = lastFittingLines;                   // assigning last fitting values (issue 3)                    
    ctx.font = lastFittingFont;                                                                   
    if (opts.verbose) opts.logFunction("Font used: " + ctx.font);
    const offset = opts.rect.y - lastFittingLineHeight / 2 + (opts.rect.height - lastFittingY) / 2;     // modifying calculation (issue 2)
    for (var line of lines)
        // Fill or stroke
        if (opts.stroke)
            ctx.strokeText(line.text.trim(), line.x, line.y + offset) //modified line
        else
            ctx.fillText(line.text.trim(), line.x, line.y + offset) //modified line

    // Returns font size
    return fontSize
}

morph = [
    [204, 0, 0], //red
    [204, 102, 0], //orange
    [204, 204, 0], //yellow
    [102, 204, 0], //green-yellow
    [0, 204, 0], //green
    [0, 204, 102],  //green-blue
    [0, 204, 255], //bright-blue
    [0, 128, 255], //Blue
    [0, 0, 255], //darkblue
    [127, 0, 255], //purple
    [255, 0 ,255], //pink
    [102, 0, 51], //wine
    [96, 96, 96], //gray
]

cardFrame('Zero Two', 'Darling in the FRANXX', 'https://cdn.myanimelist.net/images/characters/13/303917.jpg', 'images/cherry_blossom_frame.png')
cardMorph()