module.exports = {
    name: 'test',
    description: 'Test si le bot est connecté',
    execute(client, message, args) {
        message.channel.send("Test réussi ! En ligne depuis : " + msToTime(client.uptime))
        console.log("---------------------------------------")
    }
}

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