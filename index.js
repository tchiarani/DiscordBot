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
        client.commands.get('play').execute(message, data)

        // VOLUME
    } else if (commandName === 'volume') {
        client.commands.get('skip').execute(message, args, data)

        // SKIP
    } else if (commandName === "skip") {
        client.commands.get('skip').execute(message, data)

        // RADIOS
    } else if (commandName === "radios") {
        client.commands.get('radios').execute(message, radios)

        // MUSIQUES
    } else if (commandName === "musiques") {
        client.commands.get('musiques').execute(message, musiques)

        // BOB
    } else if (commandName === 'bob') {
        const attachment = new Discord.Attachment(photoBob)
        message.channel.send(attachment)

        // PURGE
    } else if (commandName === 'purge') {
        client.commands.get('purge').execute(message, args)

        // PAUSE
    } else if (commandName === 'pause') {
        client.commands.get('pause').execute(message, args, data)

        // RESUME
    } else if (commandName === 'resume') {
        client.commands.get('resume').execute(message, args, data)

        // QUEUE
    } else if (commandName === 'queue') {
        client.commands.get('queue').execute(message, args, data)

        // REMOVE
    } else if (commandName === 'remove') {
        client.commands.get('remove').execute(message, args, data)

        // POLL
    } else if (commandName === 'poll') {
        client.commands.get('poll').execute(message, emojisNombre)

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

        // UPTIME 
    } else if (commandName === 'uptime') {
        client.commands.get('uptime').execute(client, message, args)

        // HELP
    } else if (commandName === 'help') {
        client.commands.get('help').execute(message, args, data)
    }
})

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