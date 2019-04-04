const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ projectId: 'speech-to-text-236211' });

const bucket = storage.bucket('speech-to-text-hackday');

const Duplex = require('stream').Duplex;

exports.uploadFile = async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');

	if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
		res.set('Access-Control-Allow-Methods', 'POST');
		res.set('Access-Control-Allow-Headers', 'Content-Type');
		res.set('Access-Control-Max-Age', '3600');
		res.status(204).send('');
	} else {
		// Set CORS headers for the main request
		res.set('Access-Control-Allow-Origin', '*');

    const { guid, file, token } = req.body;

    const decoded = Buffer.from(file, 'base64');
    const stream = new Duplex();

    stream.push(decoded);
    stream.push(null);

    const tempFile = bucket.file('uploads/randomfile');

    const writeStream = tempFile.createWriteStream();

    stream.pipe(writeStream, { end: true });

    res.status(200).send('this is the response');
	}
};
