const express = require("express")
const app = express()
const colors = require("colors")
const { exec } = require("child_process")
const fs = require("fs")
const jszip = require("jszip")


app.set("view-engine", "ejs")
app.use(express.urlencoded({ extended: false}))

app.use(express.static(__dirname + "/downloads/"))

app.get("/", function (req, res) {
    res.render(__dirname + "/views/index.ejs")
})

app.post("/", function (req, res) {
    const url = req.body.url
    const format = req.body.format
    const command = `yt-dlp -x -i --audio-format ${format} -o "${__dirname + "/temp/%(title)s"}" --yes-playlist "${url}"`;
    console.log(colors.green("[DOWNLOAD] ") + "Stahuju audio z youtube")
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Chyba: ${error}`);
          return;
        }
        const num = Math.floor(Math.random() * 10000).toString()
        const zip = new jszip()
        console.log(colors.yellow("[ARCHIVE] ") + `Archivuju audio soubory do souboru playlist-${num}.zip`)
        const folder = fs.readdirSync(__dirname + "/temp/")
        folder.forEach((file) => {
            zip.file(file, fs.readFileSync(__dirname + "/temp/" + file).buffer)    
        })

        zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream(__dirname + `/downloads/playlist-${num}.zip`))
        .on('finish', function () {
            console.log(colors.yellow("[ARCHIVE] ") + `Archiv playlist-${num}.zip byl vytvořen`)
            res.redirect(`/playlist-${num}.zip`)
            folder.forEach((file) => {
            fs.rmSync(__dirname + `/temp/${file}`)
            })
        })
      });
})

const port = 5000

app.listen(port, function () {
    console.log(colors.green("[SERVER] ") + `Server běží na portu ${port}`)
})