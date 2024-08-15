import GET from './http.js'
import * as Utils from '../Utils.js'

const clientID = 'u-s4t2ud-9063f4e8ff01e5b0878f85b3cc0434661267ebbee2ae65bcba9fc2a973a6584e';
const redirectURI = 'http://localhost:8000/';

export function requestOAuth() {
	const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=public`;
	Utils.changeURL(authURL);
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
	const url = `http://localhost:8000/oauth/login/callback/?code=${encodeURIComponent(token)}`;
	// const url = `http://localhost:8000/oauth/login/callback/?code=`;

	return	GET(url)
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
