const speech = require('@google-cloud/speech').v1p1beta1;
const client = new speech.SpeechClient();
const admin = require('firebase-admin');
const axios = require('axios');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ projectId: 'speech-to-text-236211' });

const bucket = storage.bucket('speech-to-text-hackday');

const config = {
  encoding: 'WAV',
  sampleRateHertz: 44100,
  languageCode: 'en-GB',
  enableAutomaticPunctuation: true,
  audioChannelCount: 2,
  enableSeparateRecognitionPerChannel: true,
  enableWordTimeOffsets: true
};

function toTimestamp(milliseconds) {
  const t = new Date(milliseconds)
  const h = t.getUTCHours();
  const m = t.getMinutes();
  const s = t.getSeconds();
  const ms = t.getMilliseconds();

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

async function process(request, filename) {
	// Detects speech in the audio file
	const [operation] = await client.longRunningRecognize(request);
	const [response] = await operation.promise();

  const phrases = [];
	const transcription = response.results.map(result => {
		// Get a Promise representation of the final result of the job

		response.results.forEach(result => {
			// console.log(`${result.alternatives[0].transcript}`);
      let phrase = {
        words: [],
        startTime: 0,
        endTime: 0
      };

			let count = result.alternatives[0].words.length - 1;
      console.log(result.alternatives[0])
			result.alternatives[0].words.forEach(wordInfo => {
				// NOTE: If you have a time offset exceeding 2^32 seconds, use the
				// wordInfo.{x}Time.seconds.high to calculate seconds.
        const startTime =`${toTimestamp(wordInfo.startTime.seconds*1000 + wordInfo.startTime.nanos / 1000000)}`
        const endTime =`${toTimestamp(wordInfo.endTime.seconds*1000 + wordInfo.endTime.nanos / 1000000)}`


				if (phrase.words.length < 5) {
					phrase.words.push(wordInfo.word);
					if (phrase.words.length === 1) {
						phrase.startTime = startTime;
					}
          phrase.endTime = endTime;
					if (count === 0) {
            phrases.push(JSON.parse(JSON.stringify(phrase)));
					}
				} else {
          phrases.push(JSON.parse(JSON.stringify(phrase)));

					phrase.words = [wordInfo.word];
					phrase.startTime = startTime;
          phrase.endTime = 0;
          
				}
				count -= 1;
			});
		});
  });

  
  const chunks = ['WEBVTT\n\n']
  for(let phrase of phrases) {
    chunks.push(`${phrase.startTime} --> ${phrase.endTime}\n` + phrase.words.join(' ') + '\n\n')
  }

  const writeStream = bucket.file(`transcriptions/${filename}`).createWriteStream();
  writeStream.write(chunks.join(''));
	const promise = new Promise(resolve => {
    writeStream.on('finish', () => {
      resolve();
    })
  });
  writeStream.end();

  await promise;
}

exports.transcribe = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
	if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
		res.set('Access-Control-Allow-Methods', 'POST');
		res.set('Access-Control-Allow-Headers', 'Content-Type');
		res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  } 

  const {path, token, filename} = req.body;
  const vttFileName= filename.split('.')[0] + '.vtt';

	const request = {
		config: config,
		audio: {
			uri: `gs://speech-to-text-hackday/${path}`
		}
  };
  
  // notification
	process(request, vttFileName).then(() => {
    axios.post('https://us-central1-speech-to-text-236211.cloudfunctions.net/sendNotification', {
      token,
    }, {
      headers: {
        'content-type': 'application/json'
      }
    })

		res.status(200).send('done');
	});
};