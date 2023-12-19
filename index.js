import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { randomUUID } from 'crypto';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = 5002;

app.use(express.json({ limit: '20mb', extended: true }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use(cors());

app.get('/', (_req, res) => {
	res.send({
		service: 'File-Server',
		health: 'OK',
	});
});

const randomFileName = () => {
	return randomUUID().split('-').join('');
};

const storage = multer.diskStorage({
	destination: './upload',
	filename: function (_req, file, cb) {
		cb(null, randomFileName() + path.extname(file.originalname));
	},
});

const upload = multer({ storage: storage });

const fileVerification = (req, res, next) => {
	return next();
};

const uploadSingleFileResponse = (req, res) => {
	const { filename } = req.file;
	return res.send({ filename });
};

const deleteFileHandler = async (req, res) => {
	try {
		const { file } = req.body;
		const path = __dirname + '/upload/' + file;
		if (!fs.existsSync(path)) {
			return res.status(404).send({
				success: false,
				message: 'no, no',
			});
		}
		await fs.unlink(path, (err) => {
			if (err) {
				console.error(err);
				return res.status(404).send({
					success: false,
					message: err,
				});
			}
			console.log('file removed');
			//file removed
		});
		return res.status(202).send({
			success: true,
			message: 'OK, done, file removed',
		});
	} catch (err) {
		return res.status(404).send({
			success: false,
			message: err,
		});
	}
};

app.post(
	'/uploadFile',
	fileVerification,
	upload.single('file'),
	uploadSingleFileResponse
);

app.use('/videos', router);

app.post('/deleteFile', deleteFileHandler);

app.get('/getFile', (req, res) => {
	const id = req.query.id;

	return res.sendFile(__dirname + '/upload/' + id);
});

app.listen(PORT, () => {
	console.log(`Server starting in port: ${PORT}`);
});
