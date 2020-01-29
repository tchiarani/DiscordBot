const Discord = require('discord.js')
const Attachment = require('discord.js')
const search = require('yt-search')
const ytdl = require('ytdl-core')
const client = new Discord.Client()

const token = process.env.TOKEN
const prefix = '/'

const photoBob = "https://cdn.discordapp.com/attachments/407512037330255872/552972224685015050/IMG_20190304_223322.jpg"
let authorAvatar = "https://cdn.discordapp.com/avatars/226064436127989760/4445007dcbbdba7272345a16372ff662.png"
let botAvatar = ""
let dataHelp = {}

const commandes = ["play", "skip", "queue", "volume", "stop", "pause", "resume", "radios", "musiques", "radio", "purge", "poll", "help"]

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
    data[id]['firstResult'] = ''
    data[id]['queue'] = []
    data[id]['dataQueue'] = []
    data[id]['dataVideoEmbed'] = []
    data[id]['specificHelpEmbed'] = {}
}

function play(connection, message, action) {
    if (action == "Add") {
        if (data[message.guild.id]['queue'].length == 1) {
            message.channel.send(data[message.guild.id]['dataVideoEmbed'][0])
        } else {
            message.channel.send('✅ **' + data[message.guild.id]['firstResult'].title + '** de ' + data[message.guild.id]['firstResult'].author.name + ' (' + data[message.guild.id]['firstResult'].timestamp + ')')
        }
    } else if (action == "Skip") {
        message.channel.send(data[message.guild.id]['dataVideoEmbed'][0])
    }
    if (action == "Add" && data[message.guild.id]['queue'].length <= 1 || action != "Add" && data[message.guild.id]['queue'].length >= 1) {
        data[message.guild.id]['song'] = connection.playStream(ytdl(data[message.guild.id]['queue'][0], { filter: 'audioonly' }))
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
        data[message.guild.id]['dataVideoEmbed'].shift()
    } else if (action == 'Stop') {
        data[message.guild.id]['queue'] = []
        data[message.guild.id]['dataQueue'] = []
        data[message.guild.id]['dataVideoEmbed'] = []
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
    client.user.setActivity("unikorn.ga | 🦄", { type: "WATCHING" })
    setTimeout(setMyActivity, 5000)
    client.guilds.keyArray().forEach(id => initGuild(id))
    botAvatar = 'https://cdn.discordapp.com/avatars/' + client.users.first().id + '/' + client.users.first().avatar + '.png'
    dataHelp = new Discord.RichEmbed()
        .setTitle("Liste des commandes")
        .setDescription("Préfix : **" + prefix + "**")
        .setAuthor("Besoin d'aide ?", botAvatar, "https://unikorn.ga/bot")
        .setColor('#7289DA')
        .setFooter("unikorn.ga | /help", authorAvatar)
        .addField("----------------", prefix + commandes.slice(0, commandes.length / 2 + 1).join("\n" + prefix), true)
        .addField("----------------", prefix + commandes.slice(commandes.length / 2 + 1, commandes.length).join("\n" + prefix), true)
})

client.on('message', message => {
    // Voice only works in guilds, if the message does not come from a guild, we ignore it
    //console.log(message.guild.id)
    if (!message.guild) return
    if (!message.content.startsWith(prefix)) return
    let contenuMessage = message.content;
    message.content = message.content.toLowerCase()

    // JOIN
    if (message.content === prefix + 'join') {
        if (message.guild.me.voiceChannel) return message.channel.send('Désolé, je suis déjà connecté dans ' + message.guild.me.voiceChannel.name)
            // Only try to join the sender's voice channel if they are in one themselves
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    message.channel.send('Connecté dans ' + message.member.voiceChannel.name)
                    message.react('✅')
                }).catch(console.log)
        } else {
            message.reply('il faut être dans un salon vocal.')
            message.react('❌')
        }

        // STOP
    } else if ((message.content === prefix + 'stop') || (message.content === prefix + 's')) {
        if (message.member.voiceChannel === message.guild.me.voiceChannel) {
            message.member.voiceChannel.leave()
            message.react('🛑')
        } else {
            message.channel.send('Je ne suis pas connecté dans un salon avec vous !')
            message.react('❌')
        }

        // PLAY
    } else if ((message.content === prefix + 'play') || (message.content === prefix + 'p')) {
        let helpDescriptions = "Lance une musique depuis YouTube\n\nLance une radio enregistrée\n\nLance une musique enregistrée"
        let helpCommands =
            prefix + 'play *[mots-clés]*\n' +
            prefix + 'play *[url]*\n' +
            prefix + 'play *[radio]*\n' +
            prefix + 'play *[radio] [volume]*\n' +
            prefix + 'play *[musique]*\n' +
            prefix + 'play *[musique] [volume]*\n'
        setSpecificHelp(message.guild.id, "play", helpCommands, helpDescriptions)
        message.channel.send(data[message.guild.id]['specificHelpEmbed'])
    } else if ((message.content.startsWith(prefix + 'play ')) || (message.content.startsWith(prefix + 'p '))) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    let find = false
                    let args = message.content.split(' ')
                    let maxLength = Math.max(Object.keys(radios).length, Object.keys(musiques).length)
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
                    if (!find) {
                        let words = message.content.substring(message.content.indexOf(" ") + 1, message.content.length)
                        search(words, function(err, r) {
                            message.react('▶')
                            if (err) throw err
                            videos = r.videos
                            data[message.guild.id]['firstResult'] = videos[0]
                            dataMusic = '**' + videos[0].title + '** de ' + videos[0].author.name + ' (' + videos[0].timestamp + ')'
                            let music = 'https://www.youtube.com' + videos[0].url
                            setMusicEmbed(message.guild.id, videos[0])
                            data[message.guild.id]['queue'].push(music)
                            data[message.guild.id]['dataQueue'].push(dataMusic)
                            play(connection, message, 'Add')
                        })
                    }
                }).catch(console.log)
        } else {
            message.reply('il faut être dans un salon vocal.')
        }

        // RADIO
    } else if (message.content === prefix + 'radio') {
        let helpDescriptions = "Lance une webradio"
        let helpCommands = prefix + 'radio *[url]*'
        setSpecificHelp(message.guild.id, "radio", helpCommands, helpDescriptions)
        message.channel.send(data[message.guild.id]['specificHelpEmbed'])
    } else if (message.content.startsWith(prefix + 'radio ')) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    let words = message.content.split(' ')
                    data[message.guild.id]['song'] = connection.playArbitraryInput(words[1])
                    data[message.guild.id]['song'].setVolume(1 / 25)
                    message.react('📻')
                }).catch(console.log)
        }

        // VOLUME
    } else if ((message.content === prefix + 'volume') || (message.content === prefix + 'v')) {
        if (message.member.voiceChannel && data[message.guild.id]['song'].length != 0) {
            message.reply("🔊 Volume : " + data[message.guild.id]['song'].volume)
        } else {
            message.reply("Aucune musique dans la file d'attente")
        }
    } else if ((message.content.startsWith(prefix + 'volume')) || (message.content.startsWith(prefix + 'v'))) {
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

        // SKIP
    } else if (message.content === prefix + "skip") {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    message.react('⏭')
                    end(connection, message, "Skip")
                }).catch(console.log)
        }

        // HELP
    } else if ((message.content === prefix + "help") || (message.content === prefix + "h")) {
        message.react('❓')
        message.channel.send(dataHelp)

        // RADIOS
    } else if (message.content === prefix + "radios") {
        message.react('📻')
        message.channel.send(radiosList)

        // MUSIQUES
    } else if (message.content === prefix + "musiques") {
        message.react('🎵')
        message.channel.send(musiquesList)

        // BOB
    } else if (message.content === prefix + 'bob') {
        const attachment = new Discord.Attachment(photoBob)
        message.channel.send(attachment)

        // PURGE
    } else if (message.content === prefix + 'purge') {
        let helpDescriptions = "Supprime les *[0-100]* derniers messages"
        let helpCommands = prefix + 'purge *[0-100]*'
        setSpecificHelp(message.guild.id, "purge", helpCommands, helpDescriptions)
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
    } else if (message.content === prefix + 'pause') {
        if (message.member.voiceChannel) {
            message.react('⏸')
            data[message.guild.id]['song'].pause()
            data[message.guild.id]['song'].setSpeaking(false)
        }

        // RESUME
    } else if (message.content === prefix + 'resume') {
        if (message.member.voiceChannel) {
            message.react('⏯')
            data[message.guild.id]['song'].resume()
            data[message.guild.id]['song'].setSpeaking(true)
        }

        // QUEUE
    } else if ((message.content === prefix + 'queue') || (message.content === prefix + 'q')) {
        if (data[message.guild.id]['dataQueue'].length != 0) {
            message.channel.send('File d\'attente :\n🔊 ' + data[message.guild.id]['dataQueue'][0] + '\n' + data[message.guild.id]['dataQueue'].slice(1, 10).map((value, index) => emojisNombre[index] + ' ' + value).join("\n"))
        } else {
            message.channel.send("Aucune musique dans la file d'attente.")
        }
    } else if ((message.content.startsWith(prefix + 'queue ')) || (message.content.startsWith(prefix + 'q '))) {
        let queueNumber = message.content.substring(message.content.indexOf(" ") + 1, message.content.length + 1)
        if (queueNumber >= 0 && queueNumber <= 100) {
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
            message.channel.send("La valeur doit être comprise entre 1 et 100.")
        }

        // REMOVE
    } else if ((message.content === prefix + 'remove') || (message.content === prefix + 'r')) {
        let helpDescriptions = "Supprime les musiques en paramètre"
        let helpCommands = prefix + 'remove *1 3 4...*'
        setSpecificHelp(message.guild.id, "remove", helpCommands, helpDescriptions)
        message.channel.send(data[message.guild.id]['specificHelpEmbed'])
    } else if (message.content.startsWith(prefix + 'remove ') || message.content.startsWith(prefix + 'r ')) {
        let queueNumbers = message.content.substring(message.content.indexOf(" ") + 1, message.content.length + 1).split(" ")
        let nbRemoved = 0
        for (let i = 0; i < queueNumbers.length; i++) {
            if (data[message.guild.id]['dataQueue'][queueNumbers[i] - nbRemoved] != undefined) {
                message.channel.send('❌ ' + data[message.guild.id]['dataQueue'][queueNumbers[i] - nbRemoved])
                data[message.guild.id]['queue'].splice(queueNumbers[i] - nbRemoved, 1)
                data[message.guild.id]['dataQueue'].splice(queueNumbers[i] - nbRemoved, 1)
                data[message.guild.id]['dataVideoEmbed'].splice(queueNumbers[i] - nbRemoved, 1)
                nbRemoved++
            } else {
                message.channel.send("Pas de numéro **" + queueNumbers[i] + "** dans la file d'attente.")
            }
        }

        // POLL
    } else if ((message.content === prefix + 'poll') || (message.content === prefix + 'sondage')) {
        let helpDescriptions = "Crée un sondage"
        let helpCommands = prefix + 'poll Faut-il poser une question ? "Oui" "Non"'
        setSpecificHelp(message.guild.id, "poll", helpCommands, helpDescriptions)
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
            .setFooter("Réagissez pour voter")
            .setTitle(question)
            .setAuthor("Sondage crée par " + message.author.username)
        for (let i = 0; i < choices.length; i++) {
            pollEmbed.addField(emojisNombre[i], choices[i], false)
        }
        message.channel.send(pollEmbed)
            .then(function(poll) {
                for (let i = 0; i < choices.length; i++) {
                    poll.react(emojisNombre[i])
                }
            }).catch(console.log())
        message.delete()

        // TEST 
    } else if (message.content === prefix + 'test') {
        message.channel.send("Test réussi !")
        console.log("---------------------------------------")
    }
})

client.on('reconnecting', () => {
    console.log('Reconnecting!')
})

client.on('disconnect', () => {
    console.log('Disconnect!')
    client.user.setActivity("la maintenance", { type: "WATCHING" })
    client.user.setStatus('dnd')
})

client.on('warn', () => {
    console.log('Error! : ' + error)
    client.user.setActivity("la maintenance", { type: "WATCHING" })
    client.user.setStatus('dnd')
})

client.on('error', () => {
    console.log('Warn!')
    client.user.setActivity("la maintenance", { type: "WATCHING" })
    client.user.setStatus('dnd')
})

function setSpecificHelp(id, command, helpCommands, helpDescritions) {
    data[id]['specificHelpEmbed'] = new Discord.RichEmbed()
        .setTitle("Commande(s) disponible(s) pour :")
        .setDescription("**" + prefix + command + "**")
        .setAuthor("Besoin d'aide ?⁢⁢", botAvatar, "https://unikorn.ga/bot")
        .setColor('#7289DA')
        .setFooter("unikorn.ga | " + prefix + command, authorAvatar)
        .addField("**Commande :**", helpCommands, true)
        .addField("**Description :**", helpDescritions, true)
}

function setMusicEmbed(id, video) {
    data[id]['dataVideoEmbed']
        .push(new Discord.RichEmbed()
            .setTitle(video.title)
            .setDescription("Durée : " + video.timestamp)
            .setAuthor(video.author.name, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/YouTube_social_red_square_%282017%29.svg/300px-YouTube_social_red_square_%282017%29.svg.png", "https://youtube.com/channel/" + video.author.id)
            .setThumbnail("https://img.youtube.com/vi/" + video.videoId + "/mqdefault.jpg")
            .setColor('#FF0000')
            .setURL("https://youtube.com" + video.url)
        )
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
