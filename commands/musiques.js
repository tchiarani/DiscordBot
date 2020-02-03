const config = require('./../config')
const musiques = require('./../musics/musiques')

module.exports = {
    name: 'musiques',
    description: "Liste les musiques enregistrées",
    alias: [],
    usage: '',
    execute(message, args, data) {
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
                    "value": JSON.stringify(Object.keys(musiques.data)).replace(/","/g, ', ').replace(/[["]/g, '').replace(/]/g, ''),
                    "inline": true
                }]
            }
        }

        message.react('🎵')
        message.channel.send(musiquesList)
    }
}