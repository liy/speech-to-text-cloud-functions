const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
// ffmpeg static install correct ffmpeg automatically for you
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
// Points fluent-ffmpeg to the right location to look for ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic.path);
ffmpeg.setFfprobePath(ffprobeStatic.path);
// Storage
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ projectId: 'speech-to-text-236211' });

const bucket = storage.bucket('speech-to-text-hackday');
const readStream = bucket.file('examples/video-gb.mp4').createReadStream();
const writeStream = bucket.file('audios/video-gb.wav').createWriteStream();

// TODO: Create a cloud function to extracaudio. There are two options:
// 1. Write a physical file to storage, ask speech to text API to read it
// 2. Pipe the readStream of the audio directly to speech to text API
exports.extractAudio = (req, res) => {
	ffmpeg()
		.input(readStream)
		.inputFormat('mp4')
		.on('end', () => {
			console.log('Successfully converted video');
			res.status(200).send('Successfully converted video');
		})
		.on('error', (err, stdout, stderr) => {
			console.error('Error on conversion', err.message);
			console.error('stdout:', stdout);
			console.error('stderr:', stderr);
			res.status(400).send('Error on conversion: ' + err.message);
		})
		.outputFormat('wav')
		.pipe(
			writeStream,
			{ end: true }
		);
};

// download
// readStream
//   .on('error', err => {
//     console.log('error', err)
//   })
//   .on('end', () => {
//     console.log('ended')
//   })
//   .pipe(fs.createWriteStream('./test.mp4'))

// upload to bucket
// fs.createReadStream('./package.json')
//   .on('error', err => {
//     console.log('error', err)
//   })
//   .on('end', () => {
//     console.log('ended')
//   })
//   .pipe(bucket.file('uploads/package.json').createWriteStream({gzip: true}))
