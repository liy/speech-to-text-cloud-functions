const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ projectId: 'speech-to-text-236211' });

const bucket = storage.bucket('speech-to-text-hackday');


exports.uploadFile = async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');

	if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
		res.set('Access-Control-Allow-Methods', 'GET');
		res.set('Access-Control-Allow-Headers', 'Content-Type');
		res.set('Access-Control-Max-Age', '3600');
		res.status(204).send('');
	} else {
		// Set CORS headers for the main request
		res.set('Access-Control-Allow-Origin', '*');

    // get the data
    const { file, token } = Buffer.from(req.body);

    await storage.bucket(bucketName).upload(file, {
      gzip: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      }
    });

    await storage.bucket(bucketName).upload(token, {
      gzip: true,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      }
    });

    console.log('uploaded file')
    res.status(200).send('this is the response');
	}
};
