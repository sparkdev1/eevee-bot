const Data = require("../models/data.js");
const Card = require("../models/card.js");
const Shop = require("../models/shop.js");
const { createCanvas, loadImage, registerFont } = require('canvas')
const itemSchema = require('../models/item.js')
const {
  Client,
  Collection,
  Intents,
  MessageEmbed,
  MessageAttachment,
} = require("discord.js");
const { model } = require("mongoose");

const getUserFromMention = (mention, client) => {
  if (!mention) return;

  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }

    return client.users.cache.get(mention);
  }
};

const playerBalance = (player = "", message, client) => {
  if (player != "") {
    player = getUserFromMention(player, client);

    if (!player) message.reply("Por favor, utilize alguma menção válida");
  } else player = message.author;

  Data.findOne(
    {
      userID: player.id,
    },
    (err, data) => {
      if (err) console.log(err);

      if (!data) {
        const newData = new Data({
          name: player.username,
          userID: player.id,
          lb: "all",
          money: 0,
          star: 0,
          daily: 0,
        });
        newData.save().catch((err) => console.log(err));
        message.reply(
          `${player.username} tem :moneybag: 0 gold e :star: 0 estrelas.`
        );
      } else
        message.reply(
          `${player.username} tem :moneybag: ${data.money} gold e :star: ${data.star} estrelas.`
        );
    }
  );
};

const burnCards = (code, message, client) => {
  Card.findOne(
    {
      userID: message.author.id,
      cardID: code,
    },
    (err, data) => {
      if (err) {
        message.channel.send("Essa carta não pertence a você ou não existe.");
        return console.log(err);
      }

      if (!data) {
        return message.reply("Essa carta não pertence a você ou não existe.");
      }
      if (!code) {
        return message.reply("Por favor, utilize código de card válido.");
      }
      client.users.fetch(data.userID).then((user) => {
        let cardPhoto = data.cardPhoto;
        let cardName = data.cardName;
        let cardCode = data.cardID;

        let aspas = "`";
        let cardStars = data.cardStars;
        let cardDateGet = data.cardDateGet;
        let cardGoldValue =
          parseInt(data.cardAttack) +
          parseInt(data.cardDefense) +
          parseInt(data.cardIntelligence);
        const exampleEmbed = new MessageEmbed()
          .setColor("#ffffff")
          .setTitle("Deseja queimar essa carta?")
          .setDescription(
            `${aspas}${cardCode}${aspas} - ***${cardName}*** adquirida dia ${cardDateGet}`
          )
          .setThumbnail(cardPhoto)
          .addField(":star: Stars:", cardStars.toString())
          .addField(":money_with_wings: Ouro:", cardGoldValue.toString())
          .setTimestamp()
          .setFooter(user.tag, user.avatarURL());
        message.reply({ embeds: [exampleEmbed] }).then((sendMessage) => {
          sendMessage.react("❌");
          sendMessage.react("🔥");
          const filter = (reaction, user) =>
            ["❌", "🔥"].includes(reaction.emoji.name) &&
            user.id === message.author.id;
          const collector = sendMessage.createReactionCollector({
            filter,
            max: 1,
            time: 5000,
          });

          collector.on("collect", async (reaction, user) => {
            if (reaction.emoji.name === "❌" && user.id === message.author.id) {
              sendMessage.edit({ embeds: [exampleEmbed.setColor("#ff0000")] });
              await message.channel.send("Operação cancelada!");
              return;
            }
            if (reaction.emoji.name === "🔥" && user.id === message.author.id) {
              Card.findOneAndDelete(
                {
                  cardID: code,
                },
                (err) => {
                  if (err) {
                    message.channel.send(
                      "Essa carta não pertence a você ou não existe."
                    );
                    return console.log(err);
                  }
                  if (!err) {
                    Data.findOne(
                      {
                        userID: user.id,
                      },
                      (err, data) => {
                        if (err) console.log(err);
                        console.log(data);
                        if (!data) {
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
                        oldGold = parseInt(data.money);
                        oldStar = parseInt(data.star);
                        cardStars = parseInt(cardStars);
                        Data.updateOne(
                          {
                            userID: user.id,
                          },
                          {
                            money: oldGold + cardGoldValue,
                            star: oldStar + cardStars,
                          },
                          function (err, docs) {
                            if (err) {
                              console.log(err);
                            } else {
                              console.log("Updated Docs : ", docs);
                            }
                          }
                        );
                      }
                    );

                    sendMessage.edit({
                      embeds: [exampleEmbed.setColor("#00ff11")],
                    });
                    message.channel.send("Operação concluída!");
                    return;
                  } else {
                    console.log("Error removing :" + err);
                  }
                }
              );
            }
          });
        });
      });
    }
  );
};

const burnLastCard = (message, client) => {
  Card.findOne(
    {
      userID: message.author.id,
    },
    {},
    { sort: { cardID: -1 } },
    (err, data) => {
      if (err) {
        message.channel.send("Essa carta não pertence a você ou não existe.");
        return console.log(err);
      }
      if (!data) {
        return message.reply("Essa carta não pertence a você ou não existe.");
      }
      client.users.fetch(data.userID).then((user) => {
        let cardPhoto = data.cardPhoto;
        let cardName = data.cardName;
        let cardCode = data.cardID;

        let aspas = "`";
        let cardStars = data.cardStars;
        let cardDateGet = data.cardDateGet;
        let cardGoldValue =
          parseInt(data.cardAttack) +
          parseInt(data.cardDefense) +
          parseInt(data.cardIntelligence);
        const exampleEmbed = new MessageEmbed()
          .setColor("#ffffff")
          .setTitle("Deseja queimar essa carta?")
          .setDescription(
            `${aspas}${cardCode}${aspas} - ***${cardName}*** adquirida dia ${cardDateGet}`
          )
          .setThumbnail(cardPhoto)
          .addField(":star: Stars:", cardStars.toString())
          .addField(":money_with_wings: Ouro:", cardGoldValue.toString())
          .setTimestamp()
          .setFooter(user.tag, user.avatarURL());
        message.reply({ embeds: [exampleEmbed] }).then((sendMessage) => {
          sendMessage.react("❌");
          sendMessage.react("🔥");
          const filter = (reaction, user) =>
            ["❌", "🔥"].includes(reaction.emoji.name) &&
            user.id === message.author.id;
          const collector = sendMessage.createReactionCollector({
            filter,
            max: 1,
            time: 5000,
          });

          collector.on("collect", async (reaction, user) => {
            if (reaction.emoji.name === "❌" && user.id === message.author.id) {
              sendMessage.edit({ embeds: [exampleEmbed.setColor("#ff0000")] });
              await message.channel.send("Operação cancelada!");
              return;
            }
            if (reaction.emoji.name === "🔥" && user.id === message.author.id) {
              Card.findOneAndDelete(
                {
                  cardID: cardCode,
                },
                (err) => {
                  if (err) {
                    message.channel.send(
                      "Essa carta não pertence a você ou não existe."
                    );
                    return console.log(err);
                  }
                  if (!err) {
                    Data.findOne(
                      {
                        userID: user.id,
                      },
                      (err, data) => {
                        if (err) console.log(err);
                        console.log(data);
                        if (!data) {
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
                        oldGold = parseInt(data.money);
                        oldStar = parseInt(data.star);
                        cardStars = parseInt(cardStars);
                        Data.updateOne(
                          {
                            userID: user.id,
                          },
                          {
                            money: oldGold + cardGoldValue,
                            star: oldStar + cardStars,
                          },
                          function (err, docs) {
                            if (err) {
                              console.log(err);
                            } else {
                              console.log("Updated Docs : ", docs);
                            }
                          }
                        );
                      }
                    );

                    sendMessage.edit({
                      embeds: [exampleEmbed.setColor("#00ff11")],
                    });
                    message.channel.send("Operação concluída!");
                    return;
                  } else {
                    console.log("Error removing :" + err);
                  }
                }
              );
            }
          });
        });
      });
    }
  );
};

const showShop = (page = '1', message, client) => {
    if (page.match(/\d+/g) !== 0) {
           (page.match(/\d+/g)[0] - 1) * 10
        }
  Shop.find({}, {}, {skip: page, limit: 10, sort: { cardID: -1 }}, (err, data) => {
    if (err) return console.log(err);
    if (!data) message.reply("Sem itens na loja");
    if (data) {
      message.reply('Os itens disponíveis na loja são (digite esi # para ver detalhes do item.)')
      var string = [];
      data.forEach((element, index, array) => {
        string.push(
          element.itemID +
            " - " +
            element.type +
            " - " +
            element.price +
            " - " +
            element.name +
            "\n"
        );
      });
      let aspas = "```";
      message.channel.send(
        `${aspas} # | Tipo | Preco | Nome ${"\n"}${"\n"}${string.join(
          `\n`
        )} ${aspas}`
      );
    }
  });
};

const showItemInfo = (id, message, client) => {
  if (id.match(/\d+/g) !== null) {
    Shop.findOne(
      {
        itemID: id,
      },
      (err, data) => {
        if (err) return console.log(err);
        if (!data) return message.reply("Item inválido ou inexistente.");
        if (data) {
          const file = new MessageAttachment(`./${data.photo}`);
          const exampleEmbed = new MessageEmbed()
            .setColor("#ffffff")
            .setTitle(`Informações do item: ${data.name}#${data.itemID}`)
            .setDescription(
              `${data.name}  -  ${data.type
              }${"\n"}${"\n"}:money_with_wings: ***${data.price
              }***${"\n"}${"\n"}${"\n"}*Deseja comprar este item?*`
            )
            .setImage(`attachment://${data.photo.substr(7)}`);
          message.channel
            .send({ embeds: [exampleEmbed], files: [file] })
            .then((sendMessage) => {
              sendMessage.react("❌");
              sendMessage.react("✅");
              const filter = (reaction, user) =>
                ["❌", "✅"].includes(reaction.emoji.name) &&
                user.id === message.author.id;
              const collector = sendMessage.createReactionCollector({
                filter,
                max: 1,
                time: 5000,
              });

              collector.on("collect", async (reaction, user) => {
                if (
                  reaction.emoji.name === "❌" &&
                  user.id === message.author.id
                ) {
                  sendMessage.edit({
                    embeds: [exampleEmbed.setColor("#ff0000")],
                  });
                  await message.channel.send("Operação cancelada!");
                  return;
                }
                if (
                  reaction.emoji.name === "✅" &&
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
                      if (parseInt(dataUser.money) >= parseInt(data.price)) {
                        oldGold = parseInt(dataUser.money);
                        Data.updateOne(
                          {
                            userID: user.id,
                          },
                          {
                            money: oldGold - parseInt(data.price)
                          },
                          function (err, docs) {
                            if (err) {
                              console.log(err);
                            } else {
                              console.log("Updated Docs : ", docs);
                            }
                          }
                        );

                        const newItem = new itemSchema({
                          userID: user.id,
                          itemID: data.itemID,
                          name: data.name,
                          type: data.type,
                          photo: data.photo,
                        });
                        newItem.save().catch((err) => console.log(err));
                        return sendMessage.edit({
                          embeds: [exampleEmbed.setColor("#00ff11").setTitle("Compra realizada com sucesso.")],
                        });
                      } else {
                        return sendMessage.edit({
                          embeds: [exampleEmbed.setColor("#ff0000").setTitle(`Você não tem dinheiro suficiente para comprar este item`)],
                        });
                      }
                    }
                  );
                }
              });
            });
        }
      }
    );
  } else {
    return message.reply("Item inválido ou inexistente.");
  }
};


const searchPlayerItems = (id, client, args, message) => {
  if (id.match(/\d+/g) !== null) {

      var page = 0;// 10 = page 1, 20 = page 2...
      switch (client) {
          case 'p=':
              page = (args.match(/\d+/g)[0] - 1) * 10
      }
      itemSchema.find({
          userID: id.match(/\d+/g)[0]
      }, {}, { skip: page, limit: 10, }, async (err, data) => {
          if (err) console.log(err);

          if (!data) {
              return message.reply('Nenhuma carta encontrada')
          }
          if (!id) {
              return message.reply('Usuário inválido.')
          }

          var string = [];
          data.forEach((element, index, array) => {
              string.push(element.itemID + ' - ' + element.type + ' - ' + element.name + '\n')
          })
          let aspas = "```"
          message.channel.send(`${aspas} # | Tipo | Nome     |${'\n'}${'\n'}${string.join(`\n`)} ${aspas}`);
      });
  } else {
      message.reply('Houve um erro ao buscar');
  }
}

const cardFrame = async (cardName, cardFrom, cardPhoto, itemPhoto) => {

  const width = 274;
  const height = 405;

  const canvas = createCanvas(width, height)
  registerFont('./custom-fonts/Amaranth-Bold.ttf', { family: 'Amaranth' })
  const ctx = canvas.getContext('2d')

  
  ctx.drawImage(await loadImage(cardPhoto), 20, 90, 230, 300)
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
              y:290,
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

const useItem = async function (cardId, itemId, message) {
    const aspas = "`"
    const user = message.author
    Card.findOne({
      userID: user.id,
      cardID: cardId
    }, (err, data) => {
      if (err) console.log(err)
      if (!data) return message.reply('Essa carta não pertence a você ou não existe')
      if (data) {
        itemSchema.findOne({
          userID: user.id,
          itemID: itemId
        }, async (err, dataItem) => {
          if (err) console.log(err)
          if (!dataItem) return message.reply('Você não possui este item ou o item não existe.')
          if (dataItem) {

            await cardFrame(data.cardName, data.cardFrom, data.cardPhoto, dataItem.photo)
            const file = new MessageAttachment(`./scripts/framedCard.png`);
            const exampleEmbed = new MessageEmbed()
            .setColor("#ffffff")
            .setTitle(`Deseja usar ${dataItem.name} em #${aspas}${data.cardID}${aspas}?`)
            .setDescription(
              `${data.cardName} receberá ${dataItem.type} - ${dataItem.name}${"\n"}${"\n"}`
            )
            .setImage(`attachment://framedCard.png`);

            message.channel.send({ embeds: [exampleEmbed], files: [file] })



            Card.findOneAndUpdate({
              userID: user.id,
              cardID: cardId
            }, {cardItem: dataItem.id})
          }
        })
      }
    })
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

// Data.findOneAndUpdate({
//     userID: player.id
// }, (err, data) => {
//     if (err) console.log(err);

//     if (!data) {
//         const newData = new Data({
//             name: player.username,
//             userID: player.id,
//             lb: "all",
//             money: 0,
//             daily: 0,
//         })
//         newData.save().catch(err => console.log(err));
//         message.reply(`${player.username} tem :moneybag: 0 gold.`)
//     } else

//         message.reply(`${player.username} tem :moneybag: ${data.money} gold.`)

// })
module.exports.useItem = useItem;
module.exports.searchPlayerItems = searchPlayerItems;
module.exports.showItemInfo = showItemInfo;
module.exports.showShop = showShop;
module.exports.burnCards = burnCards;
module.exports.burnLastCard = burnLastCard;
module.exports.playerBalance = playerBalance;
