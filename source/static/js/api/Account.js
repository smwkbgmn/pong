import GET from './http.js'
import * as Utils from '../Utils.js'

const clientID = 'u-s4t2ud-ffe307ba0889574ea9737775e70526b8e6ba5c1aac4b9b0e80086de8f383c9ab';
const redirectURI = 'http://localhost:8000/';

export function requestOAuth() {
	const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=public`;
	Utils.changeURL(authURL);
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

export async function validateToken() {
	const accessToken = Utils.getParsedItem('accessToken');
	const url = `http://localhost:8000/oauth/login/callback/`;
	const header = {
		Authorization: `${accessToken}`,
	}

	return	GET(url, header)
			.then(response => {
				if (response.code == 'ok') {
					return {
						success: true,
					};
				}
				else {
					// response.code 확인
					// too many request면 재시도
					// access token 만료면 refresh token으로 재요청 후 갱신된 토큰 저장
					// refresh token 만료면 재로그인 -> router에서 false로 바꿔주고 connection type으로 라우팅
					return {
						success: true,
						// success: false,
						message: response.code,
					};
				}
			});
}
