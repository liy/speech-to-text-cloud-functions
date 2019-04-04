const speech = require('@google-cloud/speech').v1p1beta1;
const client = new speech.SpeechClient();
const admin = require('firebase-admin');

const gcsUri = 'gs://speech-to-text-hackday/examples/video-gb.flac';

const config = {
	encoding: 'FLAC',
	sampleRateHertz: 44100,
	languageCode: 'en-GB',
	enableAutomaticPunctuation: true,
	audioChannelCount: 2,
	enableSeparateRecognitionPerChannel: true
};

const request = {
	config: config,
	audio: {
		uri: gcsUri
	}
};

async function process() {
	const config = {
		encoding: 'FLAC',
		sampleRateHertz: 44100,
		languageCode: 'en-GB',
		enableAutomaticPunctuation: true,
		audioChannelCount: 2,
		enableSeparateRecognitionPerChannel: true,
		enableWordTimeOffsets: true
	};

	const request = {
		config: config,
		audio: {
			uri: gcsUri
		}
	};

	// Detects speech in the audio file
	const [operation] = await client.longRunningRecognize(request);
	const [response] = await operation.promise();

	const transcription = response.results.map(result => {
		// Get a Promise representation of the final result of the job

		response.results.forEach(result => {
			console.log(`Transcription: ${result.alternatives[0].transcript}`);
			let phrase = {
				words: [],
				startTime: 0,
				endTime: 0
			};

			let count = result.alternatives[0].words.length - 1;
			result.alternatives[0].words.forEach(wordInfo => {
				// NOTE: If you have a time offset exceeding 2^32 seconds, use the
				// wordInfo.{x}Time.seconds.high to calculate seconds.
				const startSecs =
					`${wordInfo.startTime.seconds}` +
					`.` +
					wordInfo.startTime.nanos / 100000000;
				const endSecs =
					`${wordInfo.endTime.seconds}` +
					`.` +
					wordInfo.endTime.nanos / 100000000;

				if (phrase.words.length < 5) {
					phrase.words.push(wordInfo.word);
					if (phrase.words.length === 1) {
						phrase.startTime = startSecs;
					}
					if (count === 0) {
						phrase.endTime = endSecs;
						console.log(`${phrase.startTime} --> ${phrase.endTime}`);
						console.log(phrase.words.join(' '));
						console.log('');
					}
					phrase.endTime = endSecs;
				} else {
					console.log(`${phrase.startTime} --> ${phrase.endTime}`);
					console.log(phrase.words.join(' '));
					console.log('');

					phrase.words = [wordInfo.word];
					phrase.startTime = startSecs;
					phrase.endTime = 0;
				}
				count -= 1;
			});
		});
	});
	return transcription;
}

exports.transcribe = (req, res) => {
	process().then(transcription => {
		res.status(200).send(transcription);
	});
};

process();
