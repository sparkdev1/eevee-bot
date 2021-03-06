// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed, MessageAttachment, ReactionCollector, MessageButton, MessageActionRow } = require('discord.js');
const { token, prefix, mongoConst, TEST_ENVIORMENT } = require('./config.json');
const mongoose = require('mongoose');
const cardSchema = require('./models/card')
const dataSchema = require('./models/data.js')
const card = require('./scripts/cards.js');
const char = require('./scripts/characters.js');
const mal = require('./scripts/mal.js')
const player = require("./scripts/player.js");
const { send } = require('process');


mongoose.connect(mongoConst, { useNewUrlParser: true, useUnifiedTopology: true })
cardSchema.findOne({},{},{ sort: { cardID: -1 }},(err, data) => fs.writeFile('./models/id.txt', (data.cardID + 1).toString(), (error) => {
    if (error) throw err;
    console.log(`Current ID is: ${data.cardID}`)
}))
console.log('Successfully connected to MongoDB')
// Create a new client instance
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});


const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

const talkedRecently = new Set();
const talkedRecentlyBurn = new Set();

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix.toUpperCase()) && !message.content.startsWith(prefix.toLowerCase()) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === 'help' && TEST_ENVIORMENT == 'false') {
        let aspas = "```"
        message.reply(`${aspas}eview ou ev - visualiza a ??ltima carta ou uma espec??fica (ex: ev 23)${'\n'}${'\n'}
ebag - visualiza invent??rio${'\n'}${'\n'}
eburn ou eb - exibe um menu mostrando o valor da carta e depois a queima (ex: eb 23)${'\n'}${'\n'}
emultiburn ou emb - exibe um menu mostrando o valor das cartas e depois as queima (ex: eb 23 435 5123 42)${'\n'}${'\n'}
ecollection ou ec - exibe as 10 ??ltimas cartas da sua cole????o ou de algu??m, para ver mais, usar o seguinte par??metro (ec @spark *, sendo * o n??mero da p??gina)${'\n'}${'\n'}
edrop ou ed - dropa 3 cartas de personagens de animes e jogos${'\n'}${'\n'}
egive ou eg - permite dar uma carta a algum usu??rio (eg @spark 234)${'\n'}${'\n'}
eshop - visualiza a loja${'\n'}${'\n'}
eshopinfo ou esi - exibe as informa????es de um item e permite compra-lo (esi 1)${'\n'}${'\n'}
einventory ou ei - exibe seu invent??rio ou de algu??m${'\n'}${'\n'}
euse - usa algum item em alguma carta (euse 435 2)${'\n'}${'\n'}
emorph ou em - muda a cor da borda de alguma carta, a carta deve possuir borda (em 4341)${'\n'}${'\n'}
${aspas}`)
    }

    if (command === 'view' || command === 'v' && TEST_ENVIORMENT == 'false') {
        if (args[0]) {
            return (card.searchSpecificCard(args[0], client, message))
        }
        return (card.searchLastCard(client, message))
    }

    if (command === 'drop' || command === 'd' && TEST_ENVIORMENT == 'false') {
        if (talkedRecently.has(message.author.id) && message.author.id != '212640369261674496') {
            await player.getPlayerCooldown(message);
            return
        } else {
            if (message.author.id != '212640369261674496') {
            talkedRecently.add(message.author.id);
            }
                    setTimeout(() => {
                        // Removes the user from the set after a minute
                        talkedRecently.delete(message.author.id);
                    }, 509000);
            try {
                console.log(`${message.author.tag} is dropping.`)
                await mal.zeraDrop()
                if (typeof activeDrop !== 'undefined') {
                    message.reply('Aguarde um momento, tem outro drop ativo.')
                    return
                }
                delete (activeDrop)
                var activeDrop = true
                const drop = []
                drop.push(await mal.setDrop())
                // sleep
                message.reply(`Estou dropando 3 cartas, boa sorte ${message.author}!`)
                message.channel.send(await card.createDropTemplate(drop)).then(sendMessage => {
                    sendMessage.react("1??????")
                    sendMessage.react("2??????")
                    sendMessage.react("3??????")
                    const filter = (reaction, user) => ["1??????", "2??????", "3??????"].includes(reaction.emoji.name) && user.id == message.author.id && user.id != '889885729273020516';
                    const collector = sendMessage.createReactionCollector({ filter, max: 1, time: 20000 });
                    var today = new Date();

                    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
                    collector.on('collect', async (reaction, user) => {
                        if (reaction.emoji.name === "1??????") {
                            if (drop[0][0]['picked']) {
                                return message.channel.send(`<@${user.id}> ${drop[0][0]['picked'].message}`)
                            }
                            drop[0][0]['picked'] = { message: 'Essa carta j?? foi pega' }
                            var values = await card.generateCardValues();
                            var cardID = fs.readFileSync('./models/id.txt', 'utf-8')
                            cardSchema.incrementID(cardID)
                            var fullName = drop[0][0].char
                            const newCard = new cardSchema({
                                userID: user.id,
                                cardID: cardID,
                                cardName: fullName,
                                cardFrom: drop[0][0].title,
                                cardStars: values[0].s,
                                cardAttack: values[0].a,
                                cardDefense: values[0].d,
                                cardIntelligence: values[0].i,
                                cardDateGet: date,
                                cardPhoto: drop[0][0].img
                            })
                            newCard.save().catch(err => console.log(err));
                            let cardStarsE = ''
                            for (let i = 1; i <= values[0].s; i++) {
                                cardStarsE += ":star: "
                            }
                            let aspas = "`"
                            await message.channel.send(`<@${user.id}> pegou ${aspas}${cardID}${aspas} ***${fullName}*** com  ${cardStarsE} estrelas`)
                            drop[0][0]['picked'] = { message: 'Essa carta j?? foi pega' }
                            return;
                        }
                        if (reaction.emoji.name === "2??????") {
                            if (drop[0][1]['picked']) {
                                return message.channel.send(`<@${user.id}> ${drop[0][1]['picked'].message}`)
                            }
                            drop[0][1]['picked'] = { message: 'Essa carta j?? foi pega' }
                            var values = await card.generateCardValues();
                            var cardID = fs.readFileSync('./models/id.txt', 'utf-8')
                            cardSchema.incrementID(cardID)
                            var fullName = drop[0][1].char
                            const newCard = new cardSchema({
                                userID: user.id,
                                cardID: cardID,
                                cardName: fullName,
                                cardFrom: drop[0][1].title,
                                cardStars: values[0].s,
                                cardAttack: values[0].a,
                                cardDefense: values[0].d,
                                cardIntelligence: values[0].i,
                                cardDateGet: date,
                                cardPhoto: drop[0][1].img
                            })
                            newCard.save().catch(err => console.log(err));
                            let cardStarsE = ''
                            for (let i = 1; i <= values[0].s; i++) {
                                cardStarsE += ":star: "
                            }
                            let aspas = "`"
                            await message.channel.send(`<@${user.id}> pegou ${aspas}${cardID}${aspas} ***${fullName}*** com  ${cardStarsE} estrelas`)
                            drop[0][1]['picked'] = { message: 'Essa carta j?? foi pega' }
                            return;
                        }
                        if (reaction.emoji.name === "3??????") {
                            if (drop[0][2]['picked']) {
                                return message.channel.send(`<@${user.id}> ${drop[0][2]['picked'].message}`)
                            }
                            drop[0][2]['picked'] = { message: 'Essa carta j?? foi pega' }
                            var values = await card.generateCardValues();
                            var cardID = fs.readFileSync('./models/id.txt', 'utf-8')
                            cardSchema.incrementID(cardID)
                            var fullName = drop[0][2].char
                            const newCard = new cardSchema({
                                userID: user.id,
                                cardID: cardID,
                                cardName: fullName,
                                cardFrom: drop[0][2].title,
                                cardStars: values[0].s,
                                cardAttack: values[0].a,
                                cardDefense: values[0].d,
                                cardIntelligence: values[0].i,
                                cardDateGet: date,
                                cardPhoto: drop[0][2].img
                            })
                            newCard.save().catch(err => console.log(err));
                            let cardStarsE = ''
                            for (let i = 1; i <= values[0].s; i++) {
                                cardStarsE += ":star: "
                            }
                            let aspas = "`"
                            await message.channel.send(`<@${user.id}> pegou ${aspas}${cardID}${aspas} ***${fullName}*** com  ${cardStarsE} estrelas`)
                            drop[0][2]['picked'] = { message: 'Essa carta j?? foi pega' }
                            return;
                        }
                    });

                    setTimeout(function () {
                        sendMessage.edit('_Esse drop expirou e n??o pode mais ser resgatado_')
                        return;
                    }, 20000)
                    if (message.author.id != '212640369261674496') {
                    talkedRecently.add(message.author.id);
                    return player.updatePlayerCooldown(message);
                    }
                    setTimeout(() => {
                        // Removes the user from the set after a minute
                        talkedRecently.delete(message.author.id);
                    }, 509000);
                })
            } catch (e) {
                console.log(e)
                return message.channel.send('Houve umm erro, perd??o.')
            }
        }
    } 
    if (command === 'cd' && TEST_ENVIORMENT == 'false') {
        await player.getPlayerCooldown(message);
        return
    }

    if (command === 'collection' || command === 'c' && TEST_ENVIORMENT == 'false') {


        await card.searchCardCollection(args[0] ?? message.author.id, args[1], message, args[2])

        // Adds the user to the set so that they can't talk for a minute
    }


    if (command === 'bag' && TEST_ENVIORMENT == 'false') {
        return await player.playerBalance(args[0], message, client)
    }

    if (command === 'burn' || command === 'b' && TEST_ENVIORMENT == 'false') {


        if (talkedRecentlyBurn.has(message.author.id)) {
            let aspas = "`"
            message.channel.send(`Espere ${aspas}5${aspas} segundos antes de usar o comando denovo - <@${message.author.id}>`)
        } else {
            try {
                if (!args[0]) {
                    player.burnLastCard(message, client)
                } else {
                    player.burnCards(args[0], message, client)
                }
            } catch (e) {
                console.log(e)
                return message.channel.send('Houve um erro ao realizar a a????o.')
            }
        }
        talkedRecentlyBurn.add(message.author.id);
        setTimeout(() => {
            // Removes the user from the set after a minute
            talkedRecentlyBurn.delete(message.author.id);
        }, 5000);
    }
    if (command === 'multiburn' || command === 'mb' && TEST_ENVIORMENT == 'false') {


        if (talkedRecentlyBurn.has(message.author.id)) {
            let aspas = "`"
            message.channel.send(`Espere ${aspas}5${aspas} segundos antes de usar o comando denovo - <@${message.author.id}>`)
        } else {
            try {
                if (args) {
                    player.multiBurnCards(args, message, client)
                } else {
                    message.channel.send('Insira as cartas que deseja queimar')
                    return
                }
            } catch (e) {
                console.log(e)
                return message.channel.send('Houve um erro ao realizar a a????o.')
            }
        }
        talkedRecentlyBurn.add(message.author.id);
        setTimeout(() => {
            // Removes the user from the set after a minute
            talkedRecentlyBurn.delete(message.author.id);
        }, 10000);
    }
    if (command === 'give' || command === 'g' && TEST_ENVIORMENT == 'false') {
        try {
            card.giveCard(args[0], args[1], message, client)
        } catch (e) {
            console.log(e)
            return message.channel.send('Houve um erro ao realizar a a????o.')
        }
    }

    if (command === 'shop' && TEST_ENVIORMENT == 'false') {
        player.showShop(args[0] ?? '1', message, client)
    }

    if (command === 'shopinfo' || command === 'si' && TEST_ENVIORMENT == 'false') {
        if (args[0]) {
            try {
                player.showItemInfo(args[0], message, client)
            } catch (e) {
                console.log(e)
                return message.channel.send('Houve um erro ao realizar a a????o.')
            }
        } else {
            return message.reply('Insira o item que deseja ver.')
        }
    }

    if (command === 'inventory' || command === 'i' && TEST_ENVIORMENT == 'false') {
        await player.searchPlayerItems(args[0] ?? message.author.id, args[1], args[2], message)
    }

    if (command === 'use' && TEST_ENVIORMENT == 'false') {
        if (!args[0] || !args[1]) {
            let aspas = "`"
            return message.channel.send(`Os par??metros est??o inv??lidos, utilize ${aspas}euse c??digoDaCarta c??digoDoItem${aspas}`)
        }
        try {
        player.useItem(args[0], args[1], message) //  cardID, itemID
        } catch (e) {
            console.log(e)
            return message.reply('Houve algum erro')
        }
    }
    if (command === "morph" || command === "m" && TEST_ENVIORMENT == 'false') {
      if (!args[0]) {
        let aspas = "`";
        return message.channel.send(
          `Os par??metros est??o inv??lidos, utilize ${aspas}emorph c??digoDaCarta${aspas}`
        );
      }
      message.channel
        .send(`Deseja come??ar o processo de metamorfose nessa carta?${'\n'}${'\n'}:money_with_wings: 500 :star: 5 `)
        .then((sendMessage) => {
          sendMessage.react("???");
          sendMessage.react("???");
          const filter = (reaction, user) =>
            ["???", "???"].includes(reaction.emoji.name) &&
            user.id === message.author.id;
          const collector = sendMessage.createReactionCollector({
            filter,
            max: 1,
            time: 10000,
          });

          collector.on("collect", async (reaction, user) => {
            if (reaction.emoji.name === "???" && user.id === message.author.id) {
              message.channel.send("Opera????o cancelada!");
              return;
            }
            if (reaction.emoji.name === "???" && user.id === message.author.id) {
                dataSchema.findOne(
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
                  if (
                    parseInt(dataUser.money) >= 500 &&
                    parseInt(dataUser.star) >= 5
                  ) {
                    oldGold = parseInt(dataUser.money);
                    oldStar = parseInt(dataUser.star);
                    dataSchema.updateOne(
                      {
                        userID: user.id,
                      },
                      {
                        money: oldGold - 500,
                        star: oldStar - 5,
                      },
                      function (err, docs) {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log("Updated Docs : ", docs);
                        }
                      }
                    );
                  } else {
                    return message.reply(
                      "Dinheiro ou estrelas insuficientes para esta a????o."
                    );
                  }
                }
              );
              card.cardMorph(args[0], message);
            }
          });
        });
    }
    if (command === 'battle' && TEST_ENVIORMENT === true) {
        if (!args[0]){
            return message.reply('Mencione o usu??rio que deseja batalhar')
        }
        message.channel.send('Hora da Batalha!!');
        await card.battleTemplate(message, args, client)
    }
});

client.login(token);