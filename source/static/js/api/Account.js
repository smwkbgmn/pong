import get from './http.js'

export async function attemptLogin() {
	const token42 = JSON.parse(sessionStorage.getItem('token42'));
	const url = `http://localhost:8000/oauth/login/callback/?code=${encodeURIComponent(token42)}`;

	return	get(url)
			.then(response => {
				if (response.code == 'ok') {
					if (sessionStorage.getItem('isLoggedIn') == 'false') {

						sessionStorage.setItem('isLogging', false);
						sessionStorage.setItem('isLoggedIn', true);

						sessionStorage.setItem('playerName', JSON.stringify(response.detail.name));
						sessionStorage.setItem('playerImage', JSON.stringify(response.detail.image));
						sessionStorage.setItem('accessToken', JSON.stringify(response.detail.accessToken));
						sessionStorage.setItem('refreshToken', JSON.stringify(response.detail.refresh_token));
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
	const accessToken = JSON.parse(sessionStorage.getItem('accessToken'));
	const url = `http://localhost:8000/oauth/login/callback/`;
	const header = {
		Authorization: `${accessToken}`,
	}

	return	get(url, header)
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
