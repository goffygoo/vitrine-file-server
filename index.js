import path from "path";
import { fileURLToPath } from 'url';
import express from "express";
import cors from "cors";
import multer from "multer";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = 5002;

app.use(express.json({ limit: "20mb", extended: true }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.use(cors())

app.get("/", (_req, res) => {
    res.send({
        "service": "File-Server",
        "health": "OK"
    })
})

const randomFileName = () => {
    return randomUUID().split('-').join('');
}

const storage = multer.diskStorage({
    destination: './upload',
    filename: function (_req, file, cb) {
        cb(null, randomFileName() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage });

const fileVerification = (req, res, next) => {
    return next();
}

const uploadSingleFileResponse = (req, res) => {
    const { filename } = req.file;
    return res.send({ filename });
}

app.post("/uploadFile", fileVerification, upload.single('file'), uploadSingleFileResponse);

app.get("/getFile", (req, res) => {
    const id = req.query.id

    return res.sendFile(__dirname + '/upload/' + id)
})

app.listen(PORT, () => {
    console.log(`Server starting in port: ${PORT}`)
})