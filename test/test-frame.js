const { createCanvas, loadImage, registerFont } = require('canvas')
async function lookPics(id) {
    return requestPromise(`https://api.jikan.moe/v3/character/${id}/pictures`).then(response => {
        if (response.statusCode === 200) {
            return JSON.parse(response.body)
        }
        return Promise.reject(response.statusCode)
    })
}

async function findMalId(charName) {
    return requestPromise(`https://api.jikan.moe/v3/character/${id}/pictures`).then(response => {
        if (response.statusCode === 200) {
            return JSON.parse(response.body)
        }
        return Promise.reject(response.statusCode)
    })
}

const createDropTemplate = async () => {

    const width = 270;
    const height = 380;

    const canvas = createCanvas(width, height)
    registerFont('./custom-fonts/PublicSans-Regular.otf', { family: 'Public Sans' })
    const ctx = canvas.getContext('2d')

    
    ctx.drawImage(await loadImage('images/try3.png'), 20, 90, 230, 300)
    ctx.drawImage(await loadImage('images/fury_tiger_frame.png'), null, null, 270, 400)

    ctx.font = '40px Public Sans'
    ctx.fillStyle = "#000000";
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle';


    drawMultilineText(
        ctx,
        "Kyoujurou Rengoku",
        {
            rect: {
                x: 135,
                y: -125,
                width: 220,
                height: 380
            },
            font: 'Arial',
            verbose: true,
            lineHeight: 1,
            minFontSize: 20,
            maxFontSize: 25
        }
    )
    drawMultilineText(
        ctx,
        "Kimetsu no Yaiba",
        {
            rect: {
                x: 135,
                y: 145,
                width: 220,
                height: 380
            },
            font: 'Arial',
            verbose: true,
            lineHeight: 1,
            minFontSize: 20,
            maxFontSize: 25
        }
    )
    

    const fs = require('fs')
    const out = fs.createWriteStream(__dirname + '/test.png')
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () => console.log('The Drop PNG file was created.'))

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

createDropTemplate()