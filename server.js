const express = require("express")
const app = express()
const colors = require("colors")
const { exec } = require("child_process")
const fs = require("fs")
const jszip = require("jszip")
const http = require("http").Server(app)
const io = require('socket.io')(http)


app.set("view-engine", "ejs")
app.use(express.urlencoded({ extended: false}))

app.use(express.static(__dirname + "/downloads/"))

app.get("/", function (req, res) {
    res.render(__dirname + "/views/index.ejs")
})

app.get("/download", function (req, res) {
    res.render(__dirname + "/views/download.ejs")
    const url = req.query.url
    const format = req.query.format
    const command = `yt-dlp -x -i -v --audio-format ${format} -o "${__dirname + "/temp/%(title)s"}" --yes-playlist "${url}"`;
    exec(command, function (error, stdout, stderr) {
        if (error) {
          console.error(`Chyba: ${error}`);
          return;
        }
        const num = Math.floor(Math.random() * 10000).toString()
        const zip = new jszip()
        io.emit("status", `Archiving audio files to playlist-${num}.zip`)
        console.log(colors.yellow("[ARCHIVE] ") + `Archiving audio files to playlist-${num}.zip`)
        const folder = fs.readdirSync(__dirname + "/temp/")
        folder.forEach((file) => {
            zip.file(file, fs.readFileSync(__dirname + "/temp/" + file).buffer)    
        })

        zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream(__dirname + `/downloads/playlist-${num}.zip`))
        .on('finish', function () {
            io.emit("status", `Archive playlist-${num}.zip was created. <a style="color: green;" href="/playlist-${num}.zip">Click to Download</a>`)
            console.log(colors.yellow("[ARCHIVE] ") + `Archiv playlist-${num}.zip byl vytvořen`)
            folder.forEach((file) => {
            fs.rmSync(__dirname + `/temp/${file}`)
            })
        })
      });
})

const port = 5000

http.listen(port, function () {
    console.log(colors.green("[SERVER] ") + `Server běží na portu ${port}`)
})