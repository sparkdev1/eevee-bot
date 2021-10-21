const Data = require("../models/data.js");
const Card = require("../models/card.js");
const cardScripts = require("../scripts/cards.js")
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

const multiBurnCards = (code, message, client) => {
  var codes = []
  code.forEach(element => {
    codes.push(
    element
    )
  });
  Card.find(
    {
      userID: message.author.id,
      cardID: {$in: codes}
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
      client.users.fetch(data[0].userID).then((user) => {

        let cardName = data.cardName;
        let cardCode = data.cardID;

        let aspas = "`";

        goldCalc = []
        data.forEach(element => {
          goldCalc.push(
          parseInt(element.cardAttack) +
          parseInt(element.cardDefense) +
          parseInt(element.cardIntelligence))
        });

        starCalc = []
        data.forEach(element => {
          starCalc.push(
          parseInt(element.cardStars))
          });

        var desc = []
        data.forEach(element => {
          desc.push(`${aspas}${element.cardID}${aspas} - ***${element.cardName}*** adquirida dia ${element.cardDateGet}`)
        });
        const reducer = (accumulator, curr) => accumulator + curr;
        const exampleEmbed = new MessageEmbed()
          .setColor("#ffffff")
          .setTitle("Deseja queimar as seguintes cartas?")
          .setDescription(
            desc.join("\n")
          )
          .setThumbnail(user.avatarURL())
          .addField(":star: Stars:", starCalc.reduce(reducer).toString())
          .addField(":money_with_wings: Ouro:", goldCalc.reduce(reducer).toString())
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
            time: 10000,
          });

          collector.on("collect", async (reaction, user) => {
            if (reaction.emoji.name === "❌" && user.id === message.author.id) {
              sendMessage.edit({ embeds: [exampleEmbed.setColor("#ff0000").setTitle("Operação cancelada!")] });
              return;
            }
            if (reaction.emoji.name === "🔥" && user.id === message.author.id) {
              Card.deleteMany(
                {
                  userID: message.author.id,
                  cardID: {$in: codes}
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

                        Data.updateOne(
                          {
                            userID: user.id,
                          },
                          {
                            money: oldGold + goldCalc.reduce(reducer),
                            star: oldStar + starCalc.reduce(reducer),
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
                      embeds: [exampleEmbed.setColor("#00ff11").setTitle("Operação concluída!")],
                    });
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

const showShop = (page, message, client) => {
  if (page.match(/\d+/g) !== 0) {
    (page.match(/\d+/g)[0] - 1) * 10
  }
  Shop.find({}, {}, { skip: page, limit: 10, sort: { cardID: -1 } }, (err, data) => {
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

          await cardScripts.cardFrame(data.cardName, data.cardFrom, data.cardPhoto, dataItem.photo)
          const file = new MessageAttachment(`./scripts/framedCard.png`);
          const exampleEmbed = new MessageEmbed()
            .setColor("#ffffff")
            .setTitle(`Deseja usar ${dataItem.name} em #${aspas}${data.cardID}${aspas}?`)
            .setDescription(
              `${data.cardName} receberá ${dataItem.type} - ${dataItem.name}${"\n"}${"\n"}`
            )
            .setImage(`attachment://framedCard.png`);

          message.channel.send({ embeds: [exampleEmbed], files: [file] }).then((sendMessage) => {
            sendMessage.react("❌");
            sendMessage.react("✅");
            const filter = (reaction, user) =>
              ["❌", "✅"].includes(reaction.emoji.name) &&
              user.id === message.author.id;
            const collector = sendMessage.createReactionCollector({
              filter,
              max: 1,
              time: 10000,
            });

            collector.on("collect", async (reaction, user) => {
              if (
                reaction.emoji.name === "❌" &&
                user.id === message.author.id
              ) {
                return sendMessage.edit({
                  embeds: [exampleEmbed.setColor("#ff0000").setTitle('Operação cancelada!')],
                });

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
                    cardFrame: dataItem.itemID,
                    framePhoto: dataItem.photo
                  },
                  function (err, docs) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("Updated Docs : ", docs);
                    }
                  }
                );
                itemSchema.findOneAndDelete(
                  {
                    userID: data.userID,
                    itemID: dataItem.itemID,
                  },
                  (err) => {
                    if (err) {
                      message.channel.send(
                        "Você não tem esse item, ou ocorreu um erro."
                      );
                      return console.log(err);
                    }})
                sendMessage.edit({
                    embeds: [exampleEmbed.setColor("#00ff11").setTitle(`${dataItem.type} inserido com sucesso em #${aspas}${data.cardID}${aspas} ${data.cardName}`)],
                }); return 
              }
            })
          })
        }
      })
    }
  })
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
    module.exports.multiBurnCards = multiBurnCards
    module.exports.useItem = useItem;
    module.exports.searchPlayerItems = searchPlayerItems;
    module.exports.showItemInfo = showItemInfo;
    module.exports.showShop = showShop;
    module.exports.burnCards = burnCards;
    module.exports.burnLastCard = burnLastCard;
    module.exports.playerBalance = playerBalance;
