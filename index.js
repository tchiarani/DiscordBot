const Discord = require('discord.js')
const Attachment = require('discord.js')
const search = require('yt-search')
const ytdl = require('ytdl-core')
const client = new Discord.Client()

const token = process.env.TOKEN
const prefix = '/'

const photoBob = 'https://cdn.discordapp.com/attachments/407512037330255872/552972224685015050/IMG_20190304_223322.jpg'
const photoDr = 'https://cdn.discordapp.com/attachments/372772306553929729/571715565144637446/13_-_Dr_PxxxxCAT_PEEPOODO-01.png'

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

const emojisNombre = ['\:one:', '\:two:', '\:three:', '\:four:', '\:five:', '\:six:', '\:seven:', '\:height:', '\:nine:']

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
}

function play(connection, message, action) {
    if (action == "Add") {
        if (data[message.guild.id]['queue'].length == 1) {
            message.channel.send(data[message.guild.id]['dataVideoEmbed'][0])
        } else {
            message.channel.send('**' + data[message.guild.id]['firstResult'].title + '** de ' + data[message.guild.id]['firstResult'].author.name + ' (' + data[message.guild.id]['firstResult'].timestamp + ') ajoutée à la file')
        }
    } else if (action == "Skip") {
        message.channel.send(data[message.guild.id]['dataVideoEmbed'][0])
    }
    if (action == "Add" && data[message.guild.id]['queue'].length <= 1 || action != "Add" && data[message.guild.id]['queue'].length >= 1) {
        data[message.guild.id]['song'] = connection.playStream(ytdl(data[message.guild.id]['queue'][0], { filter: 'audioonly' }))
        data[message.guild.id]['song'].setVolume(1 / 50)

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
    console.log(`-----\nBot connecté, avec ${client.users.size} utilisateurs, dans ${client.guilds.size} serveurs différents.\n-----`)
    client.user.setActivity("unikorn.ga | 🦄", { type: "WATCHING" })
    setTimeout(setMyActivity, 5000)
    client.guilds.keyArray().forEach(id => initGuild(id))
})

client.on('message', message => {
    // Voice only works in guilds, if the message does not come from a guild, we ignore it
    //console.log(message.guild.id)
    if (!message.guild) return
    if (!message.content.startsWith(prefix)) return
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
    } else if ((message.content.startsWith(prefix + 'play ')) || (message.content.startsWith(prefix + 'p '))) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    var find = false
                    var args = message.content.split(' ')
                    var maxLength = Math.max(Object.keys(radios).length, Object.keys(musiques).length)
                    for (var i = 0; i < maxLength; i++) {
                        if (args[1] == Object.keys(radios)[i]) {
                            data[message.guild.id]['song'] = connection.playArbitraryInput(Object.values(radios)[i][0])
                            data[message.guild.id]['song'].setVolume(1 / 50)
                            var words = message.content.split(' ')
                            if (words[2] >= 0 && words[2] <= 200) {
                                data[message.guild.id]['song'].setVolume(words[2] / 5000)
                            }
                            find = true
                            message.channel.send('Vous écoutez **Radio GOUFFRE** en mode ***' + Object.values(radios)[i][1].toUpperCase() + '***  dans **' + message.member.voiceChannel.name + '**')
                            message.react('📻')
                        } else if (args[1] == Object.keys(musiques)[i]) {
                            data[message.guild.id]['song'] = connection.playFile(Object.values(musiques)[i][0])
                            data[message.guild.id]['song'].setVolume(1 / 50)
                            var words = message.content.split(' ')
                            if (words[2] >= 0 && words[2] <= 200) {
                                data[message.guild.id]['song'].setVolume(words[2] / 5000)
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
    } else if ((message.content.startsWith(prefix + 'radio ')) || (message.content.startsWith(prefix + 'r '))) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    var words = message.content.split(' ')
                    data[message.guild.id]['song'] = connection.playArbitraryInput(words[1])
                    data[message.guild.id]['song'].setVolume(1 / 50)
                    message.react('📻')
                }).catch(console.log)
        }

        // VOL
    } else if ((message.content.startsWith(prefix + 'volume ')) || (message.content.startsWith(prefix + 'v '))) {
        if (message.member.voiceChannel) {
            var words = message.content.split(' ')
            if (words[1] >= 0 && words[1] <= 200) {
                data[message.guild.id]['song'].setVolume(words[1] / 5000)
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
        message.react('📜')
        message.channel.bulkDelete(1).catch(console.error)
        message.channel.send(dataHelp)

        // BOB
    } else if (message.content === prefix + 'bob') {
        const attachment = new Discord.Attachment(photoBob)
        message.channel.send(attachment)

        // PURGE
    } else if (message.content.startsWith(prefix + 'purge ')) {
        var args = message.content.split(' ')
        if (!args[1] || args[1] < 1 || args[1] > 100) return message.reply("Veuillez rentrer un nombre compris entre 1 et 100.")
        message.channel.bulkDelete(args[1] + 1).catch(console.error)

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
            message.channel.send('File d\'aatente :\n🔊 ' + data[message.guild.id]['dataQueue'][0] + '\n' + data[message.guild.id]['dataQueue'].slice(1, 10).map((value, index) => emojisNombre[index] + ' ' + value).join("\n"))
        } else {
            message.channel.send("Aucune musique dans la file d'attente")
        }

        // POLL
    } else if (message.content.startsWith(prefix + 'poll ')) {
        let question = message.content.substring(message.content.indexOf(" ") + 1, message.content.indexOf("?") + 1)
        var choices = message.content.substring(message.content.indexOf("?") + 1, message.content.length + 1).replace(/"/gi, '').split(' ')
        if (!choices[1]) {
            message.reply('Utilisation de ' + prefix + 'poll : ' + prefix + 'poll Faut-il poser une question ? "Oui" "Non"')
            return
        }
        const pollEmbed = new Discord.RichEmbed()
            .setColor(0xffffff)
            .setFooter("Réagissez pour voter")
            .setTitle(question)
            .setAuthor("Sondage crée par " + message.author.username)
        for (let i = 0; i < choices.length; i++) {
            pollEmbed.setDescription(emojisNombre[i] + " " + choices[i])
        }
        message.channel.send(pollEmbed)
            .then(function(poll) {
                for (let i = 0; i < choices.length; i++) {
                    poll.react(emojisNombre[i])
                }
            }).catch(console.log());

        // TEST 
    } else if (message.content === prefix + 'test') {
        message.channel.send("Test réussi ! Uptime : " + client.uptime)
        console.log("---------------------------------------")
    }
})

client.on('reconnecting', () => {
    console.log('Reconnecting!')
})
client.on('disconnect', () => {
    console.log('Disconnect!')
    client.user.setActivity("la maintenance", { type: "WATCHING" })
})


const dataHelp = {
    "embed": {
        "description": "Préfix : **" + prefix + "**",
        "color": 7506394,
        "footer": {
            "text": "/help | unikorn.ga"
        },
        "author": {
            "name": "Besoin d'aide ?",
            "icon_url": photoDr
        },
        "fields": [{
                "name": "__**----------------------**__       Commandes",
                "value": "/play *[mots clés]*\n/play *[url]*\n/play *[radio]*\n/play *[musique]*\n/radio *[url]*\n/skip",
                "inline": true
            },
            {
                "name": "__**----------------------**__",
                "value": "/vol *[0-200]*\n/pause\n/resume\n/purge *[nombre]*\n/join\n/stop",
                "inline": true
            },
            {
                "name": "__Radios :__",
                "value": JSON.stringify(Object.keys(radios)).replace(/","/g, ', ').replace(/[["]/g, '').replace(/]/g, ''),
                "inline": false
            },
            {
                "name": "__Musiques :__",
                "value": JSON.stringify(Object.keys(musiques)).replace(/","/g, ', ').replace(/[["]/g, '').replace(/]/g, ''),
                "inline": true
            }
        ]
    }
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