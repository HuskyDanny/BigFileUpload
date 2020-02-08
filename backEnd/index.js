const express = require("express");
const sleep = require("sleep");
const app = express();
const cors = require("cors");
const path = require("path");
const fse = require("fs-extra");
const PORT = 3001;
const multiparty = require("multiparty");

const UPLOADDIR = path.join(__dirname, "/files");

app.use(cors());
app.post("/bigFileUpload", (req, res, next) => {
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    const chunk = files.chunk[0];
    const index = fields.index;
    const fileName = fields.filename;
    const chunkDir = `${UPLOADDIR}/${fileName}`;

    try {
      if (!fse.existsSync(chunkDir)) {
        fse.mkdirsSync(chunkDir);
      }
      await fse.move(chunk.path, `${chunkDir}/${index}`);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send(err.message);
    }
    sleep.sleep(1);
    res.send("Received");
  });
});

app.get("/merge", async (req, res, next) => {
  const TARGET = path.join(__dirname, "/target");
  const fileName = `${Date.now()}-${req.query.filename}`;
  const filePath = req.query.filepath;
  try {
    await mergeFiles(`${TARGET}/${fileName}`, filePath);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }

  res.send("merged");
});

const mergeFiles = async (destPath, filePath) => {
  const chunkDir = `${UPLOADDIR}/${filePath}`;
  const chunkPaths = await fse.readdir(chunkDir);

  await fse.writeFile(destPath, "");

  chunkPaths.map(chunkPath => {
    const currFilePath = `${chunkDir}/${chunkPath}`;
    fse.appendFileSync(destPath, fse.readFileSync(currFilePath));
    fse.unlinkSync(currFilePath);
  });

  fse.rmdirSync(chunkDir);
};

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
