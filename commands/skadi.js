const axios = require('axios');

module.exports = {
    name: 'skadi',
    description: ['Affiche la ToDoList du projet Skadi'],
    usage: [''],
    alias: [''],
    execute(client, message, args, data) {

        // Make a request for a user with a given ID
        axios.get('https://trello.com/b/Tq88EA4I.json')
            .then(function(response) {
                console.log(response.data.cards[0].idList)
                const cards = response.data.cards
                console.log(cards)

                let dataTrello = new Discord.RichEmbed()
                    .setTitle("Liste des tâches")
                    .setAuthor("Skadi", config.botAvatar, "http://cubeofsteel.com:8123/index.html?worldname=Empire&mapname=surface&zoom=6&x=-4282&y=64&z=9035")
                    .setColor('#7289DA')
                    .setFooter("Trello | Skadi", config.authorAvatar)
                    .addField("A faire", commands.map(command => config.prefix + command.name).slice(0, (commands.size + 1) / 2).join("\n"), true)
                message.channel.send(dataTrello)
            })
            .catch(function(error) {
                console.log(error);
            });

    }
}