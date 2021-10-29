const { Client, Collection, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const fs = require('fs')
const Card = require('../models/card.js')
const Data = require("../models/data.js");
const morph = require("./morph.js")
const { createCanvas, loadImage, registerFont } = require('canvas')

const cardFrame = async (cardName, cardFrom, cardPhoto, itemPhoto) => {

    const width = 274;
    const height = 405;
  
    const canvas = createCanvas(width, height)
    registerFont('./custom-fonts/Amaranth-Bold.ttf', { family: 'Amaranth' })
    const ctx = canvas.getContext('2d')
  
  
    ctx.drawImage(await loadImage(cardPhoto), 0, 0, 230, 300, 25, 100, 220, 250)
    ctx.drawImage(await loadImage(itemPhoto), null, null, 270, 400)
  
    ctx.font = 'Amaranth'
    ctx.fillStyle = "#000000";
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle';
  
  
    drawMultilineText(
      ctx,
      `${cardName.substr(0,32)}`,
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
      `${cardFrom.substr(0,32)}`,
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
  
    const fs = require('fs')
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(__dirname + '/framedCard.png', buffer)
    return
  
  }
  

const searchSpecificCard = (code, client, message) => {
    Card.findOne({
        cardID: code
    }, async (err, data) => {
        if (err) console.log(err);

        if (!data) {
            return message.reply('Por favor, utilize código de card válido')
        }
        if (!code) {
            return message.reply('Por favor, utilize código de card válido')
        }
        client.users.fetch(data.userID).then(async (user) => {
            var cardPhoto = data.cardPhoto
            let cardName = data.cardName
            let cardNameURL = cardName.replace(/[^A-Z0-9]+/ig, "+")
            let cardCode = data.cardID
            let cardAnimeFrom = data.cardFrom

            let cardStarsE = ''

            for (let i = 1; i <= data.cardStars; i++) {
                cardStarsE += ":star: "
            }

            if(data.morphID) {
              await morph.cardGenerateFrameMorph(data.cardName, data.cardFrom, data.framePhoto, data.morphID)
              await morph.cardMorphedFinal(data.cardPhoto)
              cardPhoto = 'morphedCard.png'
              const file = new MessageAttachment(`./scripts/morphedCard.png`);
              let cardAttack = data.cardAttack
              let cardDefense = data.cardDefense
              let cardIntelligence = data.cardIntelligence
              const exampleEmbed = new MessageEmbed()
                  .setColor("#fa5700")
                  .setAuthor(`${cardCode} owned by ${user.username}`)
                  .setThumbnail(user.avatarURL())
                  .addFields({ name: 'Stars', value: cardStarsE }, { name: '\u200b', value: '\u200b', inline: false }, { name: 'Ataque     ', value: `***:crossed_swords: ${cardAttack}***`, inline: true }, { name: 'Defesa     ', value: `***:shield: ${cardDefense}***`, inline: true }, { name: 'Inteligência     ', value: `***:books: ${cardIntelligence}***`, inline: true },)
                  .setImage('attachment://morphedCard.png')
                  .setTimestamp()
                  .setFooter(user.tag, user.avatarURL());
              return message.reply({ embeds: [exampleEmbed], files: [file] })
            }

            if(data.cardFrame) {
                await cardFrame(data.cardName, data.cardFrom, data.cardPhoto, data.framePhoto)
                cardPhoto = 'framedCard.png'
                const file = new MessageAttachment(`./scripts/framedCard.png`);
                let cardAttack = data.cardAttack
                let cardDefense = data.cardDefense
                let cardIntelligence = data.cardIntelligence
                const exampleEmbed = new MessageEmbed()
                    .setColor("#fa5700")
                    .setAuthor(`${cardCode} owned by ${user.username}`)
                    .setThumbnail(user.avatarURL())
                    .addFields({ name: 'Stars', value: cardStarsE }, { name: '\u200b', value: '\u200b', inline: false }, { name: 'Ataque     ', value: `***:crossed_swords: ${cardAttack}***`, inline: true }, { name: 'Defesa     ', value: `***:shield: ${cardDefense}***`, inline: true }, { name: 'Inteligência     ', value: `***:books: ${cardIntelligence}***`, inline: true },)
                    .setImage('attachment://framedCard.png')
                    .setTimestamp()
                    .setFooter(user.tag, user.avatarURL());
                return message.reply({ embeds: [exampleEmbed], files: [file] })
            }
            let cardAttack = data.cardAttack
            let cardDefense = data.cardDefense
            let cardIntelligence = data.cardIntelligence
            const exampleEmbed = new MessageEmbed()
                .setColor("#fa5700")
                .setTitle(cardName)
                .setURL(`https://myanimelist.net/character.php?cat=character&q=${cardNameURL}`)
                .setAuthor(`${cardCode} owned by ${user.username}`)
                .setDescription(`__${cardAnimeFrom}__`)
                .setThumbnail(user.avatarURL())
                .addFields({ name: 'Stars', value: cardStarsE }, { name: '\u200b', value: '\u200b', inline: false }, { name: 'Ataque     ', value: `***:crossed_swords: ${cardAttack}***`, inline: true }, { name: 'Defesa     ', value: `***:shield: ${cardDefense}***`, inline: true }, { name: 'Inteligência     ', value: `***:books: ${cardIntelligence}***`, inline: true },)
                .setImage(cardPhoto)
                .setTimestamp()
                .setFooter(user.tag, user.avatarURL());
            message.reply({ embeds: [exampleEmbed] })
        })
    });
}

const searchLastCard = (client, message) => {
    Card.findOne({
        userID: message.author.id
    }, {}, { sort: { cardID: -1 } }, (err, data) => {
        if (err) console.log(err);

        if (!data) {
            return message.reply('Você não possui cartas.')
        }
        client.users.fetch(data.userID).then(async (user) => {
            let cardPhoto = data.cardPhoto
            let cardName = data.cardName
            let cardNameURL = cardName.replace(/[^A-Z0-9]+/ig, "+")
            let cardCode = data.cardID
            let cardAnimeFrom = data.cardFrom

            let cardStarsE = ''

            for (let i = 1; i <= data.cardStars; i++) {
                cardStarsE += ":star: "
            } if(data.cardFrame) {
                await cardFrame(data.cardName, data.cardFrom, data.cardPhoto, data.framePhoto)
                cardPhoto = 'framedCard.png'
                const file = new MessageAttachment(`./scripts/framedCard.png`);
                let cardAttack = data.cardAttack
                let cardDefense = data.cardDefense
                let cardIntelligence = data.cardIntelligence
                const exampleEmbed = new MessageEmbed()
                    .setColor("#fa5700")
                    .setTitle(cardName)
                    .setURL(`https://myanimelist.net/character.php?cat=character&q=${cardNameURL}`)
                    .setAuthor(`${cardCode} owned by ${user.username}`)
                    .setDescription(`__${cardAnimeFrom}__`)
                    .setThumbnail(user.avatarURL())
                    .addFields({ name: 'Stars', value: cardStarsE }, { name: '\u200b', value: '\u200b', inline: false }, { name: 'Ataque     ', value: `***:crossed_swords: ${cardAttack}***`, inline: true }, { name: 'Defesa     ', value: `***:shield: ${cardDefense}***`, inline: true }, { name: 'Inteligência     ', value: `***:books: ${cardIntelligence}***`, inline: true },)
                    .setImage('attachment://framedCard.png')
                    .setTimestamp()
                    .setFooter(user.tag, user.avatarURL());
                return message.reply({ embeds: [exampleEmbed], files: [file] })
            }

            let cardAttack = data.cardAttack
            let cardDefense = data.cardDefense
            let cardIntelligence = data.cardIntelligence
            const exampleEmbed = new MessageEmbed()
                .setColor("#fa5700")
                .setTitle(cardName)
                .setURL(`https://myanimelist.net/character.php?cat=character&q=${cardNameURL}`)
                .setAuthor(`${cardCode} owned by ${user.username}`)
                .setDescription(`__${cardAnimeFrom}__`)
                .setThumbnail(user.avatarURL())
                .addFields({ name: 'Stars', value: cardStarsE }, { name: '\u200b', value: '\u200b', inline: false }, { name: 'Ataque     ', value: `***:crossed_swords: ${cardAttack}***`, inline: true }, { name: 'Defesa     ', value: `***:shield: ${cardDefense}***`, inline: true }, { name: 'Inteligência     ', value: `***:books: ${cardIntelligence}***`, inline: true },)
                .setImage(cardPhoto)
                .setTimestamp()
                .setFooter(user.tag, user.avatarURL());
            message.reply({ embeds: [exampleEmbed] })
        })
    });
}

const searchCardCollection = (id, pageNumber = '1', message, keyWord = 0, ) => {
    if (id.match(/\d+/g) !== null && id.match(/\d+/g)[0] > 10000000000 && pageNumber.match(/\d+/g) !== null) {
        
        var page = 1;// 10 = page 1, 20 = page 2...
        page = (pageNumber.match(/\d+/g)[0] - 1) * 10
        Card.find({
            userID: id.match(/\d+/g)[0]
        }, {}, { skip: page, limit: 10, sort: { cardID: -1 } }, async (err, data) => {
            if (err) console.log(err);

            if (!data) {
                return message.reply('Nenhuma carta encontrada')
            }
            if (!id) {
                return message.reply('Usuário inválido.')
            }

            var string = [];
            data.forEach((element, index, array) => {
                string.push(element.cardID + ' - ' + element.cardStars + ' - ' + element.cardName + ' - ' + element.cardFrom + '\n')
            })
            let aspas = "```"
            message.channel.send(`${aspas} # | ☆ | Nome     |  Anime ${'\n'}${'\n'}${string.join(`\n`)} ${aspas}`);
        });
    } else {
        message.reply('Houve um erro ao buscar');
    }
}

const createDropTemplate = async (drop) => {
    const canvas = createCanvas(1900, 1000)
    registerFont('./custom-fonts/PublicSans-Regular.otf', { family: 'Public Sans' })
    const ctx = canvas.getContext('2d')

    ctx.drawImage(await loadImage('images/background2.jpg'), null, null, 1900, 1000)
    ctx.drawImage(await loadImage(drop[0][0].img), 50, 100, 500, 800)
    ctx.drawImage(await loadImage(drop[0][1].img), 700, 100, 500, 800)
    ctx.drawImage(await loadImage(drop[0][2].img), 1350, 100, 500, 800)

    ctx.font = '70px Public Sans'
    ctx.fillStyle = "#FFFFFF";

    var fullName =  drop[0][0].char
    ctx.fillText(fullName, 100, 80, 400)


    var fullName = drop[0][1].char
    ctx.fillText(fullName, 750, 80, 400)

    var fullName = drop[0][2].char
    ctx.fillText(fullName, 1400, 80, 400)


    ctx.fillText(drop[0][0].title, 50, 980, 500)
    ctx.fillText(drop[0][1].title, 700, 980, 500)
    ctx.fillText(drop[0][2].title, 1350, 980, 500)

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(__dirname + '/drop.png', buffer)

    
    // const out = fs.createWriteStream(__dirname + '/drop.png')
    // const stream = canvas.createPNGStream()
    // stream.pipe(out)
    // out.on('finish', () => console.log('The Drop PNG file was created.'))
    const attachment = new MessageAttachment(__dirname + '/drop.png');
    return { files: [attachment] }
}

const giveCard = (toUser, code, message, client) => {

    Card.findOne({
        userID: message.author.id,
        cardID: code
    }, (err, data) => {
        if (err) console.log(err);

        if (!data) {
            return message.reply('Essa carta não pertence a você ou não existe.')
        }
        if (!code) {
            return message.reply('Por favor, utilize código de card válido.')
        }
        client.users.fetch(data.userID).then((user) => {
            client.users.fetch(toUser.match(/\d+/g)[0]).then((theuser) => {
            let cardPhoto = data.cardPhoto
            let cardName = data.cardName
            let cardCode = data.cardID

            let aspas = "`"
            let cardStars = data.cardStars
            let cardDateGet = data.cardDateGet
            const exampleEmbed = new MessageEmbed()
                .setColor("#ffffff")
                .setTitle(`Deseja transferir essa carta para ${theuser.tag}?`)
                .setDescription(`${aspas}${cardCode}${aspas} - :star: ${cardStars} ***${cardName}*** adquirida dia ${cardDateGet}`)
                .setThumbnail(user.avatarURL())
                .setImage(cardPhoto)
                .setTimestamp()
                .setFooter(user.tag, user.avatarURL());
            message.reply({ embeds: [exampleEmbed] }).then(sendMessage => {
                sendMessage.react("❌")
                sendMessage.react("✅")
                const filter = (reaction, user) => ["❌", "✅"].includes(reaction.emoji.name) && user.id === message.author.id;
                const collector = sendMessage.createReactionCollector({ filter, max: 1, time: 20000 });

                collector.on('collect', async (reaction, user) => {
                    if (reaction.emoji.name === "❌" && user.id === message.author.id) {
                        sendMessage.edit({ embeds: [exampleEmbed.setColor("#ff0000")] })
                        await message.channel.send('Operação cancelada!')
                        return
                    }
                    if (reaction.emoji.name === "✅" && user.id === message.author.id) {
                        Data.findOne({
                            userID: user.id
                        }, (err, data) => {
                            if (err) console.log(err);
                            console.log(data)
                            if (!data) {
                                const newData = new Data({
                                    name: player.username,
                                    userID: player.id,
                                    lb: "all",
                                    money: 0,
                                    star: 0,
                                    daily: 0,
                                })
                                newData.save().catch(err => console.log(err))
                            }
                            if (code.match(/\d+/g) !== null) {
                                Card.findOneAndUpdate({
                                    userID: message.author.id,
                                    cardID: code
                                }, { userID: toUser.match(/\d+/g)[0] }, { new: true }, function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                        message.reply('Essa cartão não pertence a você ou o usuário não existe.')
                                        return
                                    }
                                })

                                sendMessage.edit({ embeds: [exampleEmbed.setColor("#00ff11")] })
                                message.channel.send('Operação concluída!')
                                return
                            }
                        })

                    }
                })
            })

        })
    })
    })

}

const cardMorph = async function (cardId, message) {
    const aspas = "`"
    const user = message.author
    Card.findOne({
      userID: user.id,
      cardID: cardId
    }, async (err, data) => {
      if (err) console.log(err)
      if (!data) return message.reply('Essa carta não pertence a você ou não existe')
      if (data) {
          if (err) console.log(err)
          if (!data) return message.reply('Você não possui este item ou o item não existe.')
          if (!data.cardFrame) return message.reply('Essa carta não possui moldura para que possa ser metamofada.')
            var morphId = await morph.cardGenerateFrameMorph(data.cardName, data.cardFrom, data.framePhoto)
            await morph.cardMorphedFinal(data.cardPhoto)

            const file = new MessageAttachment(`./scripts/morphedCard.png`);
            const exampleEmbed = new MessageEmbed()
              .setColor("#ffffff")
              .setTitle(`Deseja concluir a metamorfose em #${aspas}${data.cardID}${aspas} - ${data.cardName}?`)
              .setDescription(
                `Tentar denovo por :money_with_wings: 500 e :star: 5?${"\n"}${"\n"}`
              )
              .setImage(`attachment://morphedCard.png`);
  
            message.channel.send({ embeds: [exampleEmbed], files: [file] }).then((sendMessage) => {
              sendMessage.react("🎲");
              sendMessage.react("✅");
              const filter = (reaction, user) =>
                ["🎲", "✅"].includes(reaction.emoji.name) &&
                user.id === message.author.id;
              const collector = sendMessage.createReactionCollector({
                filter,
                max: 1,
                time: 30000,
              });
  
              collector.on("collect", async (reaction, user) => {
                if (
                  reaction.emoji.name === "🎲" &&
                  user.id === message.author.id
                ) {
                  Data.findOne(
                    {
                      userID: user.id,
                    },
                    (err, dataUser) => {
                      if (err) console.log(err);
                      console.log(dataUser);
                      if (!dataUser) {
                        const newData = new Data({
                          name: user.username,
                          userID: user.id,
                          lb: "all",
                          money: 0,
                          star: 0,
                          daily: 0,
                        });
                        newData.save().catch((err) => console.log(err));
                      }
                      if (parseInt(dataUser.money) >= 500 && parseInt(dataUser.star) >= 5) {
                        oldGold = parseInt(dataUser.money);
                        oldStar = parseInt(dataUser.star);
                        Data.updateOne(
                          {
                            userID: user.id,
                          },
                          {
                            money: oldGold - 500,
                            star: oldStar - 5
                          },
                          function (err, docs) {
                            if (err) {
                              console.log(err);
                            } else {
                              console.log("Updated Docs : ", docs);
                            }
                          }
                        )} else {
                          return message.reply('Dinheiro ou estrelas insuficientes para esta ação.')
                        }
                      });
                  return this.cardMorph(cardId, message)
                }
                if (
                  reaction.emoji.name === "✅" &&
                  user.id === message.author.id
                ) {
                  Card.updateOne(
                    {
                      cardID: data.cardID,
                    },
                    {
                      morphID: morphId
                    },
                    function (err, docs) {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log("Updated Docs : ", docs);
                      }
                    }
                  );
                  sendMessage.edit({
                      embeds: [exampleEmbed.setColor("#00ff11").setTitle(`#${aspas}${data.cardID}${aspas} ${data.cardName} foi metamorfado com sucesso `)],
                  }); return 
                }
              })
            })
         
      }
    })
  }

function random(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
}


const generateCardValues = async () => {
    var values = []
    var randomNumber = random(0, 100)

    if (randomNumber <= 20) {
        let stars = 1
        let attack = random(0, 30)
        let defense = random(0, 30)
        let intelligence = random(0, 30)
        values.push({ s: stars, a: attack, d: defense, i: intelligence })
    }

    if (randomNumber > 20 && randomNumber <= 40) {
        let stars = 2
        let attack = random(30, 50)
        let defense = random(30, 50)
        let intelligence = random(30, 50)
        values.push({ s: stars, a: attack, d: defense, i: intelligence })
    }

    if (randomNumber > 40 && randomNumber <= 70) {
        let stars = 3
        let attack = random(50, 100)
        let defense = random(50, 100)
        let intelligence = random(50, 100)
        values.push({ s: stars, a: attack, d: defense, i: intelligence })
    }

    if (randomNumber > 70 && randomNumber <= 90) {
        let stars = 4
        let attack = random(100, 250)
        let defense = random(100, 250)
        let intelligence = random(100, 250)
        values.push({ s: stars, a: attack, d: defense, i: intelligence })
    }

    if (randomNumber > 90) {
        let stars = 5
        let attack = random(250, 500)
        let defense = random(250, 500)
        let intelligence = random(250, 500)
        values.push({ s: stars, a: attack, d: defense, i: intelligence })
    }
    console.log(values)
    return values
}

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
module.exports.cardMorph = cardMorph
module.exports.cardFrame = cardFrame
module.exports.giveCard = giveCard
module.exports.searchLastCard = searchLastCard
module.exports.searchCardCollection = searchCardCollection
module.exports.searchSpecificCard = searchSpecificCard
module.exports.createDropTemplate = createDropTemplate
module.exports.generateCardValues = generateCardValues