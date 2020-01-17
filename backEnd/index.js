const express = require("express")

const app = express()

const fs = require('fs')
const path = require('path')
const fse = require("fse")
const PORT = 3000

const UPLOADDIR = path.resolve(__dirname, "/files")

app.post("/bigFileUpload", (req, res, next) => {
    const multiparty = require("multiparty")

    const form = multiparty.Form()

    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err)
        }

        const chunk = files.chunk

        const hash = fields.hash

        const fileName = fields.filename

        const chunkDir = `${UPLOADDIR}/${fileName}`

        if (!fse.existsSync(chunkDir)) {
            fse.mkdirs(chunkDir)
        }

        await fse.move(chunk.path, `${chunkDir}/${hash}`)

        res.send("Received")
    })
})


app.get("/merge", async (req, res, next) => {

    const TARGET = path.resolve(__dirname, "/target")
    const filename = req.params.filename

    await mergeFiles(`${TARGET}${filename}`, filename)

    res.send(
        "merged"
    )

})


const mergeFiles = async (filePath, fileName) => {

    const chunkDir = `${UPLOADDIR}/${fileName}`
    const chunkPaths = await fse.readdir(chunkDir)

    await fse.writeFile(filePath, "")

    chunkPaths.map((chunkPath) => {
        const currFilePath = `${chunkDir}/${chunkPath}`
        fse.appendFileSync(filePath, fse.readFileSync(currFilePath))
        fse.unlinkSync(currFilePath)
    })

    fse.rmdirSync(chunkDir)
}

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})