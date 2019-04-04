const admin = require('firebase-admin');
var { google } = require('googleapis');
// If you are running from non-google cloud services
// You need a serviceAccount json from, downloaded either from google cloud dashboard or firebase
// https://console.firebase.google.com/u/2/project/speech-to-text-236211/settings/serviceaccounts/adminsdk
// var serviceAccount = require('./firebase-service-account.json');

const app = admin.initializeApp({
	// credential: admin.credential.cert(serviceAccount),
	apiKey: 'AIzaSyDINaK58bQmZheEjRbjxwBnpmAuvFnigBM',
	authDomain: 'speech-to-text-236211.firebaseapp.com',
	databaseURL: 'https://speech-to-text-236211.firebaseio.com',
	projectId: 'speech-to-text-236211',
	storageBucket: '',
	messagingSenderId: '190734931135'
});

// TODO: update to the correct registration token once you ran the client app.
// Also note that registration token is bound to project, if you changed service account, or login account for your project.
// You have to invalidate all the existing registration token(if it is been stored anywhere)
// registration token is obtained from client side, the id to identify the client device
var registrationToken =
	'c7xEHqDQFTU:APA91bF-06_dwIMckxCmf4tnlmy9xqsL0b430WXN5M5amdfQbRU092OXBWW0tmx3LuUszAdqRKEID1lmeiDEypDRI99jW_oERkPQvucio941BWyXSGAMNoKlncok7ai95BccEzON6mmh';
// There is a specific message format: https://firebase.google.com/docs/cloud-messaging/concept-options
var message = {
	token: registrationToken,
	notification: {
		title: 'Hi, things are working!',
		body: 'Your video has been uploaded :)'
	}
};

function sendNotification(req, res) {
	// Send a message to the device corresponding to the provided registration token.
	admin
		.messaging()
		.send(message)
		.then(response => {
			// Response is a message ID string.
			console.log('Successfully sent message:', response);
			res.status(200).send(response);

			// Exit! Stop firebase hogging the process
			// app.delete();
		})
		.catch(error => {
			console.log('Error sending message:', error);
			res.status(500).send(error);

			// Exit! Stop firebase hogging the process
			// app.delete();
		});
}
exports.sendNotification = sendNotification;

// Not used.
// For obtain bearer token, for HTTP API use only
// var MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
// var SCOPES = [MESSAGING_SCOPE];
// function getAccessToken() {
//     return new Promise(function(resolve, reject) {
//         var jwtClient = new google.auth.JWT(
//             serviceAccount.client_email,
//             null,
//             serviceAccount.private_key,
//             SCOPES,
//             null
//         );

//         jwtClient.authorize(function(err, tokens) {
//           if (err) {
//               reject(err);
//               return;
//           }
//           resolve(tokens.access_token);

//           console.log(tokens.access_token)
//         });
//     });
// }
// getAccessToken();
