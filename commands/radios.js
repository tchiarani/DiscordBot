module.exports = {
    name: 'radios',
    description: ["Liste les radios enregistrées"],
    aliases: [],
    usage: [''],
    execute(message, radios) {
        message.react('📻')
        message.channel.send(radiosList)

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
                    "value": JSON.stringify(Object.keys(radios.data)).replace(/","/g, ', ').replace(/[["]/g, '').replace(/]/g, ''),
                    "inline": true
                }]
            }
        }
    }
}