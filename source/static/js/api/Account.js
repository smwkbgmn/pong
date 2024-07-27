import GET from './http.js'
import * as Utils from '../Utils.js'

const clientID = 'u-s4t2ud-ffe307ba0889574ea9737775e70526b8e6ba5c1aac4b9b0e80086de8f383c9ab';
const redirectURI = 'http://localhost:8000/';

export function requestOAuth() {
	const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=public`;
	Utils.changeURL(authURL);
}

export async function extractToken() {
	const token42 = new URLSearchParams(window.location.search).get('code');

	console.log(token42);
	
	if (token42) {
		Utils.setStringifiedItem('token42', token42);
		
		let currentURL = new URL(window.location.href);
		let cleanURL = new URL(currentURL.origin + window.location.hash);
		window.history.replaceState({}, document.title, cleanURL);
	}
}

export async function initialToken() {
	const token42 = Utils.getParsedItem('token42');
	const url = `http://localhost:8000/oauth/login/callback/?code=${encodeURIComponent(token42)}`;

	return	GET(url)
			.then(response => {
				if (response.code == 'ok') {
					if (Utils.getParsedItem('isLoggedIn') == false) {

						Utils.setStringifiedItem('isLogging', false);
						Utils.setStringifiedItem('isLoggedIn', true);
						Utils.setStringifiedItem('playerName', response.detail.name);
						Utils.setStringifiedItem('playerImage', response.detail.image);
						Utils.setStringifiedItem('accessToken', response.detail.access_token);
						Utils.setStringifiedItem('refreshToken', response.detail.refresh_token);
					}
					return {
						success: true,
					};
				}
				else {
					return {
						success: false,
						message: response.code,
					};
				}
			});
}
