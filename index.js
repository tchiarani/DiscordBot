const Discord = require('discord.js')
const fs = require('fs')
const config = require('./config')
const client = new Discord.Client()
client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const commandName = require(`./commands/${file}`);
    client.commands.set(commandName.name, commandName);
}

let data = []

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

client.login(config.token)

client.on('guildCreate', (guild) => {
    initGuild(guild.id)
})

function setMyActivity() {
    client.user.setActivity("unikorn.ga | /help", { type: "WATCHING" })
}

client.on('ready', function() {
    client.channels.get(`410564029329965063`).send(`Bot connecté dans ${client.guilds.size} serveurs différents, pour ${client.users.size} utilisateurs.`)
    console.log(`-----\nBot connecté dans ${client.guilds.size} serveurs différents, pour ${client.users.size} utilisateurs.\n-----`)
    client.user.setActivity("UniiKorn 🦄", { type: "STREAMING", url: "https://www.twitch.tv/uniikorn" })
    setTimeout(setMyActivity, 5000)
    client.guilds.keyArray().forEach(id => initGuild(id))
    config.botAvatar = client.user.avatarURL
})

client.on('message', async message => {

    const args = message.content.slice(config.prefix.length).split(' ')
    let commandName = args.shift().toLowerCase()
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.alias && cmd.alias.includes(commandName))

    if (!message.guild || message.author.bot) return
    if (!message.content.startsWith(config.prefix)) return
    if (!command) return
    if (!message.member) message.member = await message.guild.fetchMember(message)

    try {
        command.execute(client, message, args, data)
    } catch (error) {
        console.error("Error : " + error)
    }

})