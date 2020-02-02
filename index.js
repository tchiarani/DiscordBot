const Discord = require('discord.js')
const Attachment = require('discord.js')
const search = require('yt-search')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl');
const Canvas = require('canvas')
const config = require('./config')
const client = new Discord.Client()

const token = process.env.TOKEN
const prefix = config.prefix
const maxQueueDisplay = 10

const photoBob = "https://cdn.discordapp.com/attachments/407512037330255872/552972224685015050/IMG_20190304_223322.jpg"
const authorAvatar = "https://cdn.discordapp.com/avatars/226064436127989760/4445007dcbbdba7272345a16372ff662.png"
let botAvatar = ""
let dataHelp = {}

const commandes = ["play", "skip", "stop", "queue", "volume", "remove", "purge", "pause", "resume", "radio", "radios", "musiques", "poll", "help"]

const radios = {
    'dnb': ['http://195.201.98.51:8000/dnbradio_main.mp3', 'drum\'n\'bass'],
    'metal': ['http://144.217.29.205:80/live', 'métal'],
    'gold': ['http://185.33.21.112:80/highvoltage_128', 'goldé'],
    'core': ['http://192.95.18.39:5508/song', 'métalcore'],
    'prog': ['http://144.76.106.52:7000/progressive.mp3', 'progressive'],
    'samba': ['http://148.72.152.10:20028/song', 'samba'],
    'misc': ['http://185.85.29.144:8000/', 'miscellaneous'],
    'hit': ['http://185.85.29.140:8000/', 'hit allemand'],
    'dub': ['http://37.187.124.134:8010/', 'dub'],
    'black': ['http://147.135.208.34:8000/song/2/', 'blackmétal'],
    'chill': ['http://66.70.187.44:9146/song', 'chill'],
    'polk': ['http://70.38.12.44:8144/song', 'polk'],
    'muhamed': ['http://108.179.220.88:9302/song', 'allahu akbar'],
    'motherland': ['http://air.radiorecord.ru:805/hbass_320', 'cyka blyat']
        /*  'radio' : ['lien', 'texte']  */
}

const musiques = {
    'aspiradance': ['./Musique/eurodance.mp3', 'aspiradance'],
    'sw': ['./Musique/SalleDesCoffres.mp3', 'la salle des coffres']
        /*  'musique' : ['chemin', 'texte']  */
}

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

client.login(token)

client.on('ready', function() {
    console.log(`-----\nBot connecté dans ${client.guilds.size} serveurs différents, pour ${client.users.size} utilisateurs.\n-----`)
    client.user.setActivity("UniiKorn 🦄", { type: "STREAMING", url: "https://www.twitch.tv/uniikorn" })
    setTimeout(setMyActivity, 5000)
    client.guilds.keyArray().forEach(id => initGuild(id))
    botAvatar = client.user.avatarURL
    dataHelp = new Discord.RichEmbed()
        .setTitle("Liste des commandes")
        .setDescription("Préfix : **" + prefix + "**")
        .setAuthor("Besoin d'aide ?", botAvatar, "https://unikorn.ga/bot")
        .setColor('#7289DA')
        .setFooter("unikorn.ga | /help", authorAvatar)
        .addField("----------------", prefix + commandes.slice(0, (commandes.length + 1) / 2).join("\n" + prefix), true)
        .addField("----------------", prefix + commandes.slice((commandes.length + 1) / 2, commandes.length).join("\n" + prefix), true)
})

client.on('message', async message => {

    if (message.author.bot) return
    if (!message.guild) return
    if (!message.content.startsWith(prefix)) return
    if (!message.member) message.member = await message.guild.fetchMember(message)

    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();

    let contenuMessage = message.content;
    message.content = message.content.toLowerCase()

    // JOIN
    if (command === 'join') {
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
    } else if ((command === 'stop') || (command === 's')) {
        if (message.member.voiceChannel === message.guild.me.voiceChannel) {
            message.member.voiceChannel.leave()
            message.react('🛑')
        } else {
            message.channel.send('Je ne suis pas connecté dans un salon avec vous !')
            message.react('❌')
        }

        // PLAY
    } else if ((command === 'play') || (command === 'p')) {
        if (args.length === 0) {
            let helpDescriptions = "Lance ou ajoute une musique depuis YouTube\n\nLance une radio enregistrée\n\nLance une musique enregistrée"
            let helpCommands =
                prefix + 'play *[mots-clés]*\n' +
                prefix + 'play *[url]*\n' +
                prefix + 'play *[radio]*\n' +
                prefix + 'play *[radio] [volume]*\n' +
                prefix + 'play *[musique]*\n' +
                prefix + 'play *[musique] [volume]*\n'
            setSpecificHelp(message.guild, "play", ["p"], helpCommands, helpDescriptions)
            message.channel.send(data[message.guild.id]['specificHelpEmbed'])
        } else {
            if (message.member.voiceChannel) {
                message.member.voiceChannel.join()
                    .then(connection => {
                        let find = false
                        const args = contenuMessage.split(' ')
                        const maxLength = Math.max(Object.keys(radios).length, Object.keys(musiques).length)
                        for (let i = 0; i < maxLength; i++) {
                            if (args[1] == Object.keys(radios)[i]) {
                                data[message.guild.id]['song'] = connection.playArbitraryInput(Object.values(radios)[i][0])
                                data[message.guild.id]['song'].setVolume(1 / 25)
                                let words = message.content.split(' ')
                                if (words[2] >= 0 && words[2] <= 200) {
                                    data[message.guild.id]['song'].setVolume(words[2] / 2500)
                                }
                                find = true
                                message.channel.send('Vous écoutez **Radio GOUFFRE** en mode ***' + Object.values(radios)[i][1].toUpperCase() + '***  dans **' + message.member.voiceChannel.name + '**')
                                message.react('📻')
                            } else if (args[1] == Object.keys(musiques)[i]) {
                                data[message.guild.id]['song'] = connection.playFile(Object.values(musiques)[i][0])
                                data[message.guild.id]['song'].setVolume(1 / 25)
                                let words = message.content.split(' ')
                                if (words[2] >= 0 && words[2] <= 200) {
                                    data[message.guild.id]['song'].setVolume(words[2] / 2500)
                                }
                                find = true
                                message.channel.send('Vous écoutez **Radio GOUFFRE** en mode ***' + Object.values(musiques)[i][1].toUpperCase() + '***  dans **' + message.member.voiceChannel.name + '**')
                                message.react('🎵')
                                break
                            }
                        }
                        if (Number.isInteger(args[1])) {
                            if (data[message.guild.id]['musicTitle'][args[1]]) {
                                console.log(data[message.guild.id]['musicTitle'][args[1]])
                            }
                        } else if (!find) {
                            let regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/
                            if (args[1].match(regExp)) {
                                ytpl(args[1].match(regExp)[2], { limit: Infinity }, function(err, playlist) {
                                    if (err) console.log(err)
                                    message.react('▶')
                                    data[message.guild.id]['firstResult'] = playlist
                                    for (let i = 0; i < playlist.items.length; i++) {
                                        data[message.guild.id]['musicTitle'].push(playlist.items[i].title)
                                        data[message.guild.id]['musicDuration'].push(playlist.items[i].duration)
                                        let music = playlist.items[i].url_simple
                                        let dataMusic = '**' + playlist.items[i].title + '** de ' + playlist.items[i].author.name + ' (' + playlist.items[i].duration + ')'
                                        setMusicEmbed(message.guild.id, playlist.items[i], playlist.items[i].id, playlist.items[i].author.ref, playlist.items[i].url_simple, playlist.items[i].duration)
                                        data[message.guild.id]['queue'].push(music)
                                        data[message.guild.id]['dataQueue'].push(dataMusic)
                                        if (data[message.guild.id]['queue'].length == 1 && i == 0) play(connection, message, 'Add')
                                    }
                                    play(connection, message, 'Add playlist')
                                });
                            } else {
                                let words = message.content.substring(message.content.indexOf(" ") + 1, message.content.length)
                                search(words, function(err, r) {
                                    if (r.videos != undefined) {
                                        message.react('▶')
                                        if (err) throw err
                                        videos = r.videos
                                        data[message.guild.id]['firstResult'] = videos[0]
                                        if (videos[0].timestamp == 0) {
                                            videos[0].timestamp = 'Live'
                                        }
                                        data[message.guild.id]['musicTitle'].push(videos[0].title)
                                        data[message.guild.id]['musicDuration'].push(videos[0].timestamp)
                                        let music = 'https://www.youtube.com' + videos[0].url
                                        let dataMusic = '**' + videos[0].title + '** de ' + videos[0].author.name + ' (' + videos[0].timestamp + ')'
                                        setMusicEmbed(message.guild.id, videos[0], videos[0].videoId, "https://youtube.com/channel/" + videos[0].author_id, "https://youtube.com" + videos[0].url, videos[0].timestamp)
                                        data[message.guild.id]['queue'].push(music)
                                        data[message.guild.id]['dataQueue'].push(dataMusic)
                                        play(connection, message, 'Add')
                                    } else {
                                        message.react('❓')
                                    }

                                })
                            }
                        }
                    }).catch(console.log)
            } else {
                message.reply('il faut être dans un salon vocal.')
            }
        }


        // RADIO
    } else if (command === 'radio') {
        if (args.length === 0) {
            let helpDescriptions = "Lance une webradio"
            let helpCommands = prefix + 'radio *[url]*'
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
    } else if ((command === 'volume') || (command === 'v')) {
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
    } else if (command === "skip") {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    message.react('⏭')
                    end(connection, message, "Skip")
                }).catch(console.log)
        }

        // HELP
    } else if (command === "help" || command === "h") {
        message.react('❓')
        message.channel.send(dataHelp)

        // RADIOS
    } else if (command === "radios") {
        message.react('📻')
        message.channel.send(radiosList)

        // MUSIQUES
    } else if (command === "musiques") {
        message.react('🎵')
        message.channel.send(musiquesList)

        // BOB
    } else if (command === 'bob') {
        const attachment = new Discord.Attachment(photoBob)
        message.channel.send(attachment)

        // PURGE
    } else if (command === 'purge') {
        let helpDescriptions = "Supprime les *[0-100]* derniers messages"
        let helpCommands = prefix + 'purge *[0-100]*'
        setSpecificHelp(message.guild, "purge", [], helpCommands, helpDescriptions)
        message.channel.send(data[message.guild.id]['specificHelpEmbed'])
    } else if (message.content.startsWith(prefix + 'purge')) {
        let args = message.content.split(' ')
        if (args[1] == undefined || args[1] < 1 || args[1] > 100) {
            message.reply('La valeur doit être comprise entre 0 et 100.')
        } else {
            message.delete()
            message.channel.bulkDelete(args[1]).catch(console.error)
        }

        // PAUSE
    } else if (command === 'pause') {
        if (message.member.voiceChannel) {
            message.react('⏸')
            data[message.guild.id]['song'].pause()
            data[message.guild.id]['song'].setSpeaking(false)
        }

        // RESUME
    } else if (command === 'resume') {
        if (message.member.voiceChannel) {
            message.react('⏯')
            data[message.guild.id]['song'].resume()
            data[message.guild.id]['song'].setSpeaking(true)
        }

        // QUEUE
    } else if ((command === 'queue') || (command === 'q')) {
        if (data[message.guild.id]['dataQueue'].length != 0) {
            setQueueEmbed(message, data[message.guild.id]['musicTitle'], data[message.guild.id]['musicDuration'])
        } else {
            message.channel.send("Aucune musique dans la file d'attente.")
        }
    } else if ((message.content.startsWith(prefix + 'queue ')) || (message.content.startsWith(prefix + 'q '))) {
        const queueNumber = message.content.substring(message.content.indexOf(" ") + 1, message.content.length + 1)
        if (queueNumber >= 0 && queueNumber <= 1000) {
            if (data[message.guild.id]['dataQueue'][queueNumber] != undefined) {
                if (queueNumber == 0) {
                    message.channel.send('🔊 ' + data[message.guild.id]['dataQueue'][queueNumber])
                } else if (queueNumber <= 9) {
                    message.channel.send(emojisNombre[queueNumber - 1] + ' ' + data[message.guild.id]['dataQueue'][queueNumber])
                } else {
                    message.channel.send(queueNumber + '. ' + data[message.guild.id]['dataQueue'][queueNumber])
                }
            } else {
                message.channel.send("Pas ce numéro dans la file d'attente.")
            }
        } else {
            message.channel.send("La valeur doit être comprise entre 1 et 1000.")
        }

        // REMOVE
    } else if ((command === 'remove') || (command === 'r')) {
        const helpDescriptions = "Supprime les musiques en paramètre"
        const helpCommands = prefix + 'remove *1 3 4...*'
        setSpecificHelp(message.guild, "remove", ["r"], helpCommands, helpDescriptions)
        message.channel.send(data[message.guild.id]['specificHelpEmbed'])
    } else if (message.content.startsWith(prefix + 'remove ') || message.content.startsWith(prefix + 'r ')) {
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
    } else if ((command === 'poll') || (command === 'sondage')) {
        let helpDescriptions = "Crée un sondage"
        let helpCommands = prefix + 'poll Faut-il poser une question ? "Oui" "Non"'
        setSpecificHelp(message.guild, "poll", ["sondage"], helpCommands, helpDescriptions)
        message.channel.send(data[message.guild.id]['specificHelpEmbed'])
    } else if (message.content.startsWith(prefix + 'poll ') || message.content.startsWith(prefix + 'sondage ')) {
        let question = contenuMessage.substring(message.content.indexOf(" ") + 1, message.content.indexOf("?") + 1)
        let choices = contenuMessage.substring(message.content.indexOf("?") + 2, message.content.length + 1).replace(/"/gi, '').split(' ')
        if (question[1] == undefined || choices[1] == undefined || choices.length > 9) {
            message.reply('Utilisation :\n' + prefix + 'poll Faut-il poser une question ? "Oui" "Non"')
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
    } else if (command === 'avatar') {
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
    } else if (command === 'test') {
        message.channel.send("Test réussi ! En ligne depuis : " + msToTime(client.uptime))
        console.log("---------------------------------------")
    }
})

function msToTime(s) {

    function pad(n, z) {
        z = z || 2
        return ('00' + n).slice(-z)
    }

    let ms = s % 1000
    s = (s - ms) / 1000
    let secs = s % 60
    s = (s - secs) / 60
    let mins = s % 60
    let hrs = (s - mins) / 60
    s = (s - hrs) / 60

    if (hrs != 0) return pad(hrs) + 'h' + pad(mins) + 'm' + pad(secs) + 's'
    if (mins != 0) return pad(mins) + 'm' + pad(secs) + 's'
    else return pad(secs) + 's'
}

function setSpecificHelp(guild, command, alias, helpCommands, helpDescritions) {
    data[guild.id]['specificHelpEmbed'] = new Discord.RichEmbed()
        .setTitle("Commandes disponibles pour " + prefix + command + " :")
        .setAuthor("Besoin d'aide ?⁢⁢", botAvatar, "https://unikorn.ga/bot")
        .setColor('#7289DA')
        .setFooter("unikorn.ga | " + prefix + command, authorAvatar)
        .addField("**Commande :**", helpCommands, true)
        .addField("**Description :**", helpDescritions, true)
    if (alias.length == 0) {
        data[guild.id]['specificHelpEmbed'].setDescription("Aucun alias")
    } else {
        data[guild.id]['specificHelpEmbed'].setDescription("Alias : " + prefix + alias.join(", " + prefix))
    }
}

function setMusicEmbed(id, video, videoId, author_id, url, duration) {
    data[id]['dataMusicEmbed']
        .push(new Discord.RichEmbed()
            .setTitle(video.title)
            .setAuthor(video.author.name, "https://i.imgur.com/MBNSqyF.png", author_id)
            .setThumbnail("https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg")
            .setColor('#FF0000')
            .setURL(url)
        )
    if (duration == "0") {
        data[id]['dataMusicEmbed'][data[id]['dataMusicEmbed'].length - 1].setDescription("🔴 Live")
    } else {
        data[id]['dataMusicEmbed'][data[id]['dataMusicEmbed'].length - 1].setDescription(duration)
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
        "description": "Écouter une radio : **" + prefix + "p *[radio]* **",
        "color": 7506394,
        "footer": {
            "icon_url": authorAvatar,
            "text": "unikorn.ga | /radios"
        },
        "author": {
            "name": "Liste des radios",
            "url": "https://unikorn.ga/bot",
            "icon_url": botAvatar
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
        "description": "Écouter une musique : **" + prefix + "p *[musique]* **",
        "color": 7506394,
        "footer": {
            "icon_url": authorAvatar,
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