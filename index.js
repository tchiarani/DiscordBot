const Discord = require('discord.js')
const Attachment = require('discord.js')
const search = require('yt-search')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl')
const Canvas = require('canvas')
const fs = require('fs')
const config = require('./config')
const radios = require('./musics/radios')
const musiques = require('./musics/musiques')
const client = new Discord.Client()
client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const commandName = require(`./commands/${file}`);
    client.commands.set(commandName.name, commandName);
}

const maxQueueDisplay = config.maxQueueDisplay
const photoBob = "https://cdn.discordapp.com/attachments/407512037330255872/552972224685015050/IMG_20190304_223322.jpg"
let dataHelp = {}

const commandes = ["play", "skip", "stop", "queue", "volume", "remove", "purge", "pause", "resume", "radio", "radios", "musiques", "poll", "help"]

const emojisNombre = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']

let data = []

client.on('guildCreate', (guild) => {
    initGuild(guild.id)
})

function initGuild(id) {
    data[id] = []
    data[id]['song'] = []
    data[id]['firstResult'] = {}
    data[id]['queue'] = []
    data[id]['dataQueue'] = []
    data[id]['dataMusicEmbed'] = []
    data[id]['specificHelpEmbed'] = {}

    data[id]['queueEmbed'] = {}
    data[id]['musicTitle'] = []
    data[id]['musicDuration'] = []
}

function play(connection, message, action) {
    if (action == "Add") {
        if (data[message.guild.id]['queue'].length > 1) {
            message.channel.send('Ajoutée : **' + data[message.guild.id]['firstResult'].title + '** de ' + data[message.guild.id]['firstResult'].author.name + ' (' + data[message.guild.id]['firstResult'].timestamp + ')')
        }
    } else if (action == "Add playlist") {
        if (data[message.guild.id]['queue'].length > 1) {
            message.channel.send('Playlist ajoutée : **' + data[message.guild.id]['firstResult'].title + '** de ' + data[message.guild.id]['firstResult'].author.name + ' (**' + data[message.guild.id]['firstResult'].items.length + '** musiques)')
        }
    }
    if (action == "Add" && data[message.guild.id]['queue'].length <= 1 || action == "Skip" && data[message.guild.id]['queue'].length >= 1) {
        message.channel.send(data[message.guild.id]['dataMusicEmbed'][0])
        data[message.guild.id]['song'] = connection.playStream(ytdl(data[message.guild.id]['queue'][0]))
        data[message.guild.id]['song'].setVolume(1 / 25)

        data[message.guild.id]['song'].on("end", (reason) => {
            if (reason == undefined) {
                end(connection, message, "Stop")
            } else if (reason != "Skip") {
                end(connection, message, "Skip end")
            }
        })
    }
}

function end(connection, message, action) {
    if (action != "Skip end") {
        data[message.guild.id]['song'].end([action])
    }
    if (action == 'Skip' || action == "Skip end") {
        data[message.guild.id]['queue'].shift()
        data[message.guild.id]['dataQueue'].shift()
        data[message.guild.id]['dataMusicEmbed'].shift()
        data[message.guild.id]['musicTitle'].shift()
        data[message.guild.id]['musicDuration'].shift()
    } else if (action == 'Stop') {
        data[message.guild.id]['queue'] = []
        data[message.guild.id]['dataQueue'] = []
        data[message.guild.id]['dataMusicEmbed'] = []
        data[message.guild.id]['musicTitle'] = []
        data[message.guild.id]['musicDuration'] = []
    }
    if (data[message.guild.id]['queue'].length == 0) {
        connection.disconnect()
    } else {
        play(connection, message, 'Skip')
    }
}

function setMyActivity() {
    client.user.setActivity("unikorn.ga | /help", { type: "WATCHING" })
}

client.login(config.token)

client.on('ready', function() {
    console.log(`-----\nBot connecté dans ${client.guilds.size} serveurs différents, pour ${client.users.size} utilisateurs.\n-----`)
    client.user.setActivity("UniiKorn 🦄", { type: "STREAMING", url: "https://www.twitch.tv/uniikorn" })
    setTimeout(setMyActivity, 5000)
    client.guilds.keyArray().forEach(id => initGuild(id))
    config.botAvatar = client.user.avatarURL
    dataHelp = new Discord.RichEmbed()
        .setTitle("Liste des commandes")
        .setDescription("Préfix : **" + config.prefix + "**")
        .setAuthor("Besoin d'aide ?", config.botAvatar, "https://unikorn.ga/bot")
        .setColor('#7289DA')
        .setFooter("unikorn.ga | /help", config.authorAvatar)
        .addField("----------------", config.prefix + commandes.slice(0, (commandes.length + 1) / 2).join("\n" + config.prefix), true)
        .addField("----------------", config.prefix + commandes.slice((commandes.length + 1) / 2, commandes.length).join("\n" + config.prefix), true)
})

client.on('message', async message => {

    const args = message.content.slice(config.prefix.length).split(' ')
    let commandName = args.shift().toLowerCase()
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName))
    if (command) commandName = await command.name

    if (!message.guild || message.author.bot) return
    if (!message.content.startsWith(config.prefix)) return
    if (!command) return
    if (!message.member) message.member = await message.guild.fetchMember(message)

    let contenuMessage = message.content;
    message.content = message.content.toLowerCase()

    // JOIN
    if (commandName === 'join') {
        if (message.guild.me.voiceChannel) return message.channel.send('Désolé, je suis déjà connecté dans ' + message.guild.me.voiceChannel.name)

        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    message.react('✅')
                }).catch(console.log)
        } else {
            message.reply('il faut être dans un salon vocal.')
            message.react('❌')
        }

        // STOP
    } else if (commandName === 'stop') {
        client.commands.get('stop').execute(message)

        // PLAY
    } else if (commandName === 'play') {
        client.commands.get('play').execute(message, args, data, radios, musiques)

        // RADIO
    } else if (commandName === 'radio') {
        if (args.length === 0) {
            let helpDescriptions = "Lance une webradio"
            let helpCommands = config.prefix + 'radio *[url]*'
            setSpecificHelp(message.guild, "radio", [], helpCommands, helpDescriptions)
            message.channel.send(data[message.guild.id]['specificHelpEmbed'])
        } else {
            if (message.member.voiceChannel) {
                message.member.voiceChannel.join()
                    .then(connection => {
                        let words = message.content.split(' ')
                        data[message.guild.id]['song'] = connection.playArbitraryInput(words[1])
                        data[message.guild.id]['song'].setVolume(1 / 25)
                        message.react('📻')
                    }).catch(console.log)
            }
        }

        // VOLUME
    } else if ((commandName === 'volume') || (commandName === 'v')) {
        if (args.length === 0) {
            if (message.member.voiceChannel && data[message.guild.id]['song'].length != 0) {
                message.reply("🔊 Volume : " + data[message.guild.id]['song'].volume)
            } else {
                message.reply("Aucune musique dans la file d'attente")
            }
        } else {
            if (message.member.voiceChannel && data[message.guild.id]['song'].length != 0) {
                let words = message.content.split(' ')
                if (words[1] >= 0 && words[1] <= 200) {
                    data[message.guild.id]['song'].setVolume(words[1] / 2500)
                    message.react('🔊')
                } else {
                    message.channel.send('Fais pas l\'fou gamin ! ' + words[1] + ' c\'est trop fort...')
                    message.react('🛑')
                }
            }
        }

        // SKIP
    } else if (commandName === "skip") {
        client.commands.get('skip').execute(message, data)

        // HELP
    } else if (commandName === "help" || commandName === "h") {
        message.react('❓')
        message.channel.send(dataHelp)

        // RADIOS
    } else if (commandName === "radios") {
        message.react('📻')
        message.channel.send(radiosList)

        // MUSIQUES
    } else if (commandName === "musiques") {
        message.react('🎵')
        message.channel.send(musiquesList)

        // BOB
    } else if (commandName === 'bob') {
        const attachment = new Discord.Attachment(photoBob)
        message.channel.send(attachment)

        // PURGE
    } else if (commandName === 'purge') {
        let helpDescriptions = "Supprime les *[0-100]* derniers messages"
        let helpCommands = config.prefix + 'purge *[0-100]*'
        setSpecificHelp(message.guild, "purge", [], helpCommands, helpDescriptions)
        message.channel.send(data[message.guild.id]['specificHelpEmbed'])
    } else if (message.content.startsWith(config.prefix + 'purge')) {
        let args = message.content.split(' ')
        if (args[1] == undefined || args[1] < 1 || args[1] > 100) {
            message.reply('La valeur doit être comprise entre 0 et 100.')
        } else {
            message.delete()
            message.channel.bulkDelete(args[1]).catch(console.error)
        }

        // PAUSE
    } else if (commandName === 'pause') {
        if (message.member.voiceChannel) {
            message.react('⏸')
            data[message.guild.id]['song'].pause()
            data[message.guild.id]['song'].setSpeaking(false)
        }

        // RESUME
    } else if (commandName === 'resume') {
        if (message.member.voiceChannel) {
            message.react('⏯')
            data[message.guild.id]['song'].resume()
            data[message.guild.id]['song'].setSpeaking(true)
        }

        // QUEUE
    } else if (commandName === 'queue') {
        client.commands.get('queue').execute(message, args, data)

        // REMOVE
    } else if ((commandName === 'remove') || (commandName === 'r')) {
        const helpDescriptions = "Supprime les musiques en paramètre"
        const helpCommands = config.prefix + 'remove *1 3 4...*'
        setSpecificHelp(message.guild, "remove", ["r"], helpCommands, helpDescriptions)
        message.channel.send(data[message.guild.id]['specificHelpEmbed'])
    } else if (message.content.startsWith(config.prefix + 'remove ') || message.content.startsWith(config.prefix + 'r ')) {
        const queueNumbers = message.content.substring(message.content.indexOf(" ") + 1, message.content.length + 1).split(" ")
        let nbRemoved = 0
        for (let i = 0; i < queueNumbers.length; i++) {
            if (data[message.guild.id]['dataQueue'][queueNumbers[i] - nbRemoved] != undefined) {
                message.channel.send('❌ ' + data[message.guild.id]['dataQueue'][queueNumbers[i] - nbRemoved])
                data[message.guild.id]['queue'].splice(queueNumbers[i] - nbRemoved, 1)
                data[message.guild.id]['dataQueue'].splice(queueNumbers[i] - nbRemoved, 1)
                data[message.guild.id]['dataMusicEmbed'].splice(queueNumbers[i] - nbRemoved, 1)
                data[message.guild.id]['musicTitle'].splice(queueNumbers[i] - nbRemoved, 1)
                data[message.guild.id]['musicDuration'].splice(queueNumbers[i] - nbRemoved, 1)
                nbRemoved++
            } else {
                message.channel.send("Pas de numéro **" + queueNumbers[i] + "** dans la file d'attente.")
            }
        }

        // POLL
    } else if ((commandName === 'poll') || (commandName === 'sondage')) {
        let helpDescriptions = "Crée un sondage"
        let helpCommands = config.prefix + 'poll Faut-il poser une question ? "Oui" "Non"'
        setSpecificHelp(message.guild, "poll", ["sondage"], helpCommands, helpDescriptions)
        message.channel.send(data[message.guild.id]['specificHelpEmbed'])
    } else if (message.content.startsWith(config.prefix + 'poll ') || message.content.startsWith(config.prefix + 'sondage ')) {
        let question = contenuMessage.substring(message.content.indexOf(" ") + 1, message.content.indexOf("?") + 1)
        let choices = contenuMessage.substring(message.content.indexOf("?") + 2, message.content.length + 1).replace(/"/gi, '').split(' ')
        if (question[1] == undefined || choices[1] == undefined || choices.length > 9) {
            message.reply('Utilisation :\n' + config.prefix + 'poll Faut-il poser une question ? "Oui" "Non"')
            return
        }
        const pollEmbed = new Discord.RichEmbed()
            .setColor(0xffffff)
            .setAuthor("Sondage crée par " + message.author.username)
            .setTitle(question)
            .setDescription(choices.map((value, index) => emojisNombre[index] + ' ' + value).join('\n'))
            .setFooter("Réagissez pour voter")
        message.channel.send(pollEmbed)
            .then(async function(poll) {
                for (let i = 0; i < choices.length; i++) {
                    await poll.react(emojisNombre[i])
                }
            }).catch(console.log())
        message.delete()

        // AVATAR
    } else if (commandName === 'avatar') {
        let background
        if (message.mentions.users.size) {
            const taggedUser = message.mentions.users.first()
            background = await Canvas.loadImage(taggedUser.avatarURL)
        } else {
            background = await Canvas.loadImage(message.author.avatarURL)
        }
        const canvas = Canvas.createCanvas(500, 500)
        const ctx = canvas.getContext("2d")
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
        const attachment = new Discord.Attachment(canvas.toBuffer(), "userAvatar.png")
        message.channel.send(attachment)

        // TEST 
    } else if (commandName === 'test') {
        client.commands.get('test').execute(client, message, args)
    }
})

function setSpecificHelp(guild, commandName, alias, helpCommands, helpDescritions) {
    data[guild.id]['specificHelpEmbed'] = new Discord.RichEmbed()
        .setTitle("Commandes disponibles pour " + config.prefix + commandName + " :")
        .setAuthor("Besoin d'aide ?⁢⁢", config.botAvatar, "https://unikorn.ga/bot")
        .setColor('#7289DA')
        .setFooter("unikorn.ga | " + config.prefix + commandName, config.authorAvatar)
        .addField("**Commande :**", helpCommands, true)
        .addField("**Description :**", helpDescritions, true)
    if (alias.length == 0) {
        data[guild.id]['specificHelpEmbed'].setDescription("Aucun alias")
    } else {
        data[guild.id]['specificHelpEmbed'].setDescription("Alias : " + config.prefix + alias.join(", " + config.prefix))
    }
}

function setQueueEmbed(message, musicTitle, musicDuration) {
    let nbPages = Math.ceil(musicTitle.length / 10)
    let page = 1
    let indexMin = 1
    let indexMax = maxQueueDisplay + 1
    data[message.guild.id]['queueEmbed'] = new Discord.RichEmbed()
        .setTitle("File d'attente :")
        .setColor('#FF0000')
        .addField("Actuellement :", "🔊 **" + musicTitle[0] + "**", false)
    if (musicTitle.length == 1) {
        data[message.guild.id]['queueEmbed'].setFooter("1 musique")
    } else {
        data[message.guild.id]['queueEmbed'].addField("Prochainement :", musicTitle.slice(indexMin, indexMax).map((value, index) => index + 1 + '. **' + value).join('**\n') + "**", true)
        data[message.guild.id]['queueEmbed'].addField("Durée :", musicDuration.slice(indexMin, indexMax), true)
        if (nbPages == 1) {
            data[message.guild.id]['queueEmbed'].setFooter(musicTitle.length + " musiques")
        } else {
            data[message.guild.id]['queueEmbed'].setFooter(page + '/' + nbPages + " • " + musicTitle.length + " musiques")
        }
    }
    message.channel.send(data[message.guild.id]['queueEmbed'])
        .then(msg => {
            if (musicTitle.length > maxQueueDisplay) {
                msg.react('⬅️').then(res => {
                    msg.react('➡️')

                    const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅️' //&& user.id === message.author.id
                    const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡️' //&& user.id === message.author.id

                    const backwards = msg.createReactionCollector(backwardsFilter)
                    const forwards = msg.createReactionCollector(forwardsFilter)

                    backwards.on('collect', r => {
                        if (r.users[1]) r.remove(r.users.filter(u => !u.bot))
                        if (r.count == 1 || page == 1) return
                        page--
                        nbPages = Math.ceil(musicTitle.length / 10)
                        indexMin -= maxQueueDisplay
                        indexMax -= maxQueueDisplay
                        if (musicTitle[0]) data[message.guild.id]['queueEmbed'].fields[0].value = "🔊 **" + musicTitle[0] + "**"
                        if (musicTitle.length == 1) {
                            data[message.guild.id]['queueEmbed'].fields[1].value = " "
                            data[message.guild.id]['queueEmbed'].fields[2].value = " "
                            data[message.guild.id]['queueEmbed'].setFooter(page + '/' + nbPages + " • " + "1 musique")
                        } else {
                            data[message.guild.id]['queueEmbed'].fields[1].value = musicTitle.slice(indexMin, indexMax).map((value, index) => index + indexMin + '. **' + value).join('**\n') + "**"
                            data[message.guild.id]['queueEmbed'].fields[2].value = musicDuration.slice(indexMin, indexMax).join('\n')
                            data[message.guild.id]['queueEmbed'].setFooter(page + '/' + nbPages + " • " + musicTitle.length + " musiques")
                        }
                        msg.edit(data[message.guild.id]['queueEmbed'])
                    })

                    forwards.on('collect', r => {
                        if (r.users[1]) r.remove(r.users.filter(u => !u.bot))
                        if (r.count == 1 || page == nbPages) return
                        page++
                        nbPages = Math.ceil(musicTitle.length / 10)
                        indexMin += maxQueueDisplay
                        indexMax += maxQueueDisplay
                        if (musicTitle[0]) data[message.guild.id]['queueEmbed'].fields[0].value = "🔊 **" + musicTitle[0] + "**"
                        if (musicTitle.length == 1) {
                            data[message.guild.id]['queueEmbed'].fields[1].value = " "
                            data[message.guild.id]['queueEmbed'].fields[2].value = " "
                            data[message.guild.id]['queueEmbed'].setFooter(page + '/' + nbPages + " • " + "1 musique")
                        } else {
                            data[message.guild.id]['queueEmbed'].fields[1].value = musicTitle.slice(indexMin, indexMax).map((value, index) => index + indexMin + '. **' + value).join('**\n') + "**"
                            data[message.guild.id]['queueEmbed'].fields[2].value = musicDuration.slice(indexMin, indexMax).join('\n')
                            data[message.guild.id]['queueEmbed'].setFooter(page + '/' + nbPages + " • " + musicTitle.length + " musiques")
                        }
                        msg.edit(data[message.guild.id]['queueEmbed'])
                    })
                })
            }
        })
}


const radiosList = {
    "embed": {
        "description": "Écouter une radio : **" + config.prefix + "p *[radio]* **",
        "color": 7506394,
        "footer": {
            "icon_url": config.authorAvatar,
            "text": "unikorn.ga | /radios"
        },
        "author": {
            "name": "Liste des radios",
            "url": "https://unikorn.ga/bot",
            "icon_url": config.botAvatar
        },
        "fields": [{
            "name": "__Radios :__",
            "value": JSON.stringify(Object.keys(radios)).replace(/","/g, ', ').replace(/[["]/g, '').replace(/]/g, ''),
            "inline": true
        }]
    }
}

const musiquesList = {
    "embed": {
        "description": "Écouter une musique : **" + config.prefix + "p *[musique]* **",
        "color": 7506394,
        "footer": {
            "icon_url": config.authorAvatar,
            "text": "unikorn.ga | /musiques"
        },
        "author": {
            "name": "Liste des musiques",
            "url": "https://unikorn.ga/bot"
        },
        "fields": [{
            "name": "__Musiques :__",
            "value": JSON.stringify(Object.keys(musiques)).replace(/","/g, ', ').replace(/[["]/g, '').replace(/]/g, ''),
            "inline": true
        }]
    }
}