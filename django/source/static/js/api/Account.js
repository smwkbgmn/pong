import GET from './http.js'
import * as Utils from '../Utils.js'

export function requestOAuth() {
	let baseUrl = window.location.protocol + "//" + window.location.host;
	const uri = baseUrl + `/oauth/login`;
	let clientID, redirectURI;

	GET(uri).then(async response => {
		const json_response = await response.json();

		clientID = json_response.client_id;
		redirectURI = json_response.redirect_uri;
	
		const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=public`;
		Utils.changeURL(authURL);
	});
}

export async function extractToken() {
	const token = new URLSearchParams(window.location.search).get('code');

	if (token) {
		let currentURL = new URL(window.location.href);
		let cleanURL = new URL(currentURL.origin + window.location.hash);
		window.history.replaceState({}, document.title, cleanURL);
	}
	else
		Utils.setStringifiedItem('isLogging', false);

	return token;
}

export async function initialToken(token) {
	let baseUrl = window.location.protocol + "//" + window.location.host;
	const uri = baseUrl + `/oauth/login/callback/?code=${encodeURIComponent(token)}`;

	return	GET(uri)
			.then(async response => {
				if (response.status == 200) {
					if (Utils.getParsedItem('isLoggedIn') == false) {
						const json_response = await response.json();

						Utils.setStringifiedItem('isLogging', false);
						Utils.setStringifiedItem('isLoggedIn', true);
						Utils.setStringifiedItem('playerName', json_response.detail.name);
						Utils.setStringifiedItem('playerImage', json_response.detail.image);
					}
				}
				else {
					Utils.setStringifiedItem('isLogging', false);
				}
			});
}