# Discord Bot Miyawaki
___
This is my own discord bot. Build with typescript using discordjs library and some js library to support my bot features.

## Features
___
- Remove image background: Miyawaki is able to remove the background of an image leveraging the u2net model (you need a supporting application named RMBG; you can find it in my repository).
- Translation to Indonesian: Miyawaki can translate English or any foreign language to Indonesian since it uses the Google Translate API.
- Find song lyrics: Miyawaki can find the lyrics of a given song; it uses the Genius API to search the lyrics.
## Installation
___
There are three available commands on this project:
```shell
npm run dev
```
It's used to run the application in development mode.
```shell
npm run build
```
It's used to transpile ts code to javascript.
```shell
npm run start
```
It's used to run transpiled application. 

### Environment Variables
<table>
    <thead>
        <tr>
            <td>NAME</td>
            <td>REQUIRED</td>
            <td>DESCRIPTION</td>
        </tr>
    </thead>
    <tr>
        <td>DISCORD_TOKEN</td>
        <td>true</td>
        <td>Token of discord bot</td>
    </tr>
    <tr>
        <td>DISCORD_CLIENT_ID</td>
        <td>true</td>
        <td>Client id of discord bot</td>
    </tr><tr>
        <td>GENIUS_ACCESS_TOKEN</td>
        <td>true</td>
        <td>Access token of genius api</td>
    </tr>
</table>