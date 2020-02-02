const search = require('yt-search')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl')

module.exports = {
    name: 'play',
    description: 'Lance ou ajoute une musique depuis YouTube',
    usage: '<mots-clés>',
    alias: ['p'],
    execute(client, message, args, data, radios, musiques) {
        message.channel.send("Commande /play")

        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    let find = false
                    const maxLength = Math.max(Object.keys(radios).length, Object.keys(musiques).length)
                    for (let i = 0; i < maxLength; i++) {
                        if (args[0] == Object.keys(radios)[i]) {
                            data[message.guild.id]['song'] = connection.playArbitraryInput(Object.values(radios)[i][0])
                            data[message.guild.id]['song'].setVolume(1 / 25)
                            let words = message.content.split(' ')
                            if (words[2] >= 0 && words[2] <= 200) {
                                data[message.guild.id]['song'].setVolume(words[2] / 2500)
                            }
                            find = true
                            message.channel.send('Vous écoutez **Radio GOUFFRE** en mode ***' + Object.values(radios)[i][1].toUpperCase() + '***  dans **' + message.member.voiceChannel.name + '**')
                            message.react('📻')
                        } else if (args[0] == Object.keys(musiques)[i]) {
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
                    if (Number.isInteger(args[0])) {
                        if (data[message.guild.id]['musicTitle'][args[0]]) {
                            console.log(data[message.guild.id]['musicTitle'][args[0]])
                        }
                    } else if (!find) {
                        let regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/
                        if (args[0].match(regExp)) {
                            ytpl(args[0].match(regExp)[2], { limit: Infinity }, function(err, playlist) {
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
                            })
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
}