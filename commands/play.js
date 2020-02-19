const Discord = require('discord.js')
const search = require('yt-search')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl')
const radios = require('./../musics/radios')
const musiques = require('./../musics/musiques')

module.exports = {
    name: 'play',
    description: ['Lance ou ajoute une musique depuis YouTube', '', 'Lance une musique dans la file', 'Lance une radio enregistrée', '', 'Lance une musique enregistrée', ''],
    usage: ['[mots-clés]', '[url]', '[chiffre]', '[radio]', '[radio] [volume]', '[musique]', '[musique] [volume]', ],
    alias: ['p'],
    execute(client, message, args, data) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(async connection => {
                    let find = false
                    const maxLength = Math.max(Object.keys(radios.data).length, Object.keys(musiques.data).length)
                    for (let i = 0; i < maxLength; i++) {
                        if (i < Object.keys(radios.data).length && args[0].toLowerCase() == Object.keys(radios.data)[i].toLowerCase()) {
                            data[message.guild.id]['song'] = connection.playArbitraryInput(Object.values(radios.data)[i][0])
                            data[message.guild.id]['song'].setVolume(1 / 25)
                            let words = message.content.split(' ')
                            if (words[2] >= 0 && words[2] <= 200) {
                                data[message.guild.id]['song'].setVolume(words[2] / 2500)
                                message.react('🔊')
                            }
                            find = true
                            message.channel.send('Vous écoutez **Radio GOUFFRE** en mode ***' + Object.values(radios.data)[i][1].toUpperCase() + '***  dans **' + message.member.voiceChannel.name + '**')
                            message.react('📻')
                        } else if (i < Object.keys(musiques.data).length && args[0].toLowerCase() == Object.keys(musiques.data)[i].toLowerCase()) {
                            data[message.guild.id]['song'] = connection.playFile(Object.values(musiques.data)[i][0])
                            data[message.guild.id]['song'].setVolume(1 / 25)
                            let words = message.content.split(' ')
                            if (words[2] >= 0 && words[2] <= 200) {
                                data[message.guild.id]['song'].setVolume(words[2] / 2500)
                                message.react('🔊')
                            }
                            find = true
                            message.channel.send('Vous écoutez **Radio GOUFFRE** en mode ***' + Object.values(musiques.data)[i][1].toUpperCase() + '***  dans **' + message.member.voiceChannel.name + '**')
                            message.react('🎵')
                            break
                        }
                    }
                    if (!find) {
                        // PLAY SPECIFIC QUEUE SONG
                        let regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/
                        if (args[0] > 0 && args[0] < data[message.guild.id]['queue'].length) {
                            if (data[message.guild.id]['queue'][args[0]]) {
                                data[message.guild.id]['musicTitle'].splice(1, 0, data[message.guild.id]['musicTitle'].splice(args[0], 1)[0])
                                data[message.guild.id]['musicDuration'].splice(1, 0, data[message.guild.id]['musicDuration'].splice(args[0], 1)[0])
                                data[message.guild.id]['queue'].splice(1, 0, data[message.guild.id]['queue'].splice(args[0], 1)[0])
                                data[message.guild.id]['dataQueue'].splice(1, 0, data[message.guild.id]['dataQueue'].splice(args[0], 1)[0])
                                data[message.guild.id]['dataMusicEmbed'].splice(1, 0, data[message.guild.id]['dataMusicEmbed'].splice(args[0], 1)[0])
                                await client.commands.get("skip").execute(client, message, args, data)
                            }
                            // PLAY YOUTUBE PLAYLIST
                        } else if (args[0].match(regExp)) {
                            if (ytpl.validateURL(args[0].match(regExp)[2])) {
                                ytpl(args[0].match(regExp)[2], { limit: Infinity }, function(err, playlist) {
                                    if (err) throw (err)
                                    if (typeof playlist != undefined) {
                                        data[message.guild.id]['firstResult'] = playlist
                                        for (let i = 0; i < playlist.items.length; i++) {
                                            let music = playlist.items[i].url_simple
                                            let dataMusic = '**' + playlist.items[i].title + '** de ' + playlist.items[i].author.name + ' (' + playlist.items[i].duration + ')'
                                            setMusicEmbed(message.guild.id, playlist.items[i], playlist.items[i].id, playlist.items[i].author.ref, playlist.items[i].url_simple, playlist.items[i].duration)
                                            data[message.guild.id]['musicTitle'].push(playlist.items[i].title)
                                            data[message.guild.id]['musicDuration'].push(playlist.items[i].duration)
                                            data[message.guild.id]['queue'].push(music)
                                            data[message.guild.id]['dataQueue'].push(dataMusic)
                                            if (data[message.guild.id]['queue'].length == 1 && i == 0) play(connection, message, 'Add')
                                        }
                                        message.react('▶')
                                        play(connection, message, 'Add playlist')
                                    }
                                })
                            } else {
                                message.channel.send("Playlist non valide :(")
                            }
                            // PLAY YOUTUBE VIDEO
                        } else {
                            let words = message.content.substring(message.content.indexOf(" ") + 1, message.content.length)
                            search(words, function(err, r) {
                                if (r.videos != undefined) {
                                    if (err) throw err
                                    videos = r.videos
                                    data[message.guild.id]['firstResult'] = videos[0]
                                    if (videos[0].timestamp == 0) {
                                        videos[0].timestamp = 'Live'
                                    }
                                    let music = 'https://www.youtube.com' + videos[0].url
                                    let dataMusic = '**' + videos[0].title + '** de ' + videos[0].author.name + ' (' + videos[0].timestamp + ')'
                                    setMusicEmbed(message.guild.id, videos[0], videos[0].videoId, "https://youtube.com/channel/" + videos[0].author_id, "https://youtube.com" + videos[0].url, videos[0].timestamp)
                                    data[message.guild.id]['musicTitle'].push(videos[0].title)
                                    data[message.guild.id]['musicDuration'].push(videos[0].timestamp)
                                    data[message.guild.id]['queue'].push(music)
                                    data[message.guild.id]['dataQueue'].push(dataMusic)
                                    message.react('▶')
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
    }
}