const speech = require('@google-cloud/speech').v1p1beta1;
const client = new speech.SpeechClient();
const admin = require('firebase-admin');

const gcsUri = 'gs://speech-to-text-hackday/examples/video-gb.flac'

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
  },
};

async function process() {
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
    },
  };

  // Detects speech in the audio file
  const [operation] = await client.longRunningRecognize(request);
  const [response] = await operation.promise();
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  
  return transcription
}

exports.transcribe = (req, res) => {
  process().then(transcription => {
    res.status(200).send(transcription);
  });
}