const express = require("express")

const app = express()

const PORT = 3000

app.get("/bigFileUpload", (req, res) => {

    res.send("hello world")
})

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})