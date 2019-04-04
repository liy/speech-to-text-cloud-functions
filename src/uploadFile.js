exports.uploadFile = (req, res) => {
	console.log(req.body);
	res.status(200).send('this is the response');
};
