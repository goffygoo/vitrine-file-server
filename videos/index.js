import express from 'express';
import fs from 'fs';

const router = express.Router();

router.get('/', (_req, res) => {
	return res.send({
		service: 'Video-Server',
		health: 'OK',
	});
});

router.get('/video/:id', (req, res) => {
	const videoPath = `upload/${req.params.id}.mp4`;

	const videoStat = fs.statSync(videoPath);

	const fileSize = videoStat.size;

	const videoRange = req.headers.range;

	if (videoRange) {
		const parts = videoRange.replace(/bytes=/, '').split('-');

		const start = parseInt(parts[0], 10);

		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

		const chunksize = end - start + 1;

		const file = fs.createReadStream(videoPath, { start, end });

		const header = {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,

			'Accept-Ranges': 'bytes',

			'Content-Length': chunksize,

			'Content-Type': 'video/mp4',
		};

		res.writeHead(206, header);

		file.pipe(res);
	} else {
		const head = {
			'Content-Length': fileSize,

			'Content-Type': 'video/mp4',
		};

		res.writeHead(200, head);

		fs.createReadStream(videoPath).pipe(res);
	}
});

export default router;
