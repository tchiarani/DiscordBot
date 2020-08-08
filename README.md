# **Discord Bot**

Discord Bot that delivers music to your server.

## Usage

Requires [node.js](https://nodejs.org) and [discord.js](https://discord.js.org) to run.

Install the dependencies and start the application.

```
npm install
node index
```

> Don't forget to **change the token** provided in config.js.

## Documentation

**Commands list :**

|Command         |Alias                          |Description                  |
|----------------|-------------------------------|-----------------------------|
|`/avatar`       |`/icon`                        |Display server member avatar |
|`/help`         |`/h`                           |Display commands help        |
|`/pause`        |                               |Pause the current song       |
|`/play`         |`/p`                           |Play the song passed in argument |
|`/poll`         |                               |Display server member avatar |
|`/purge`        |                               |Purge latest messages        |
|`/queue`        |`/q`                           |Display server current queue |
|`/radio`        |                               |Play the radio passed in argument |
|`/remove`       |`/r`                           |Remove a song from the queue |
|`/resume`       |                               |Resume the current song      |
|`/skip`         |                               |Skip the current song        |
|`/stop`         |`/s`                           |Stop the current song and disconnect |
|`/uptime`       |                               |Display bot uptime           |
|`/volume`       |`/v`, `/vol`                   |Change volume from 0 to 200  |

## Roadmap

- [x] Fix purge command
- [ ] Add image manipulation with canvas
- [ ] Add Spotify musics to the library

## Project status

Development has stopped.
