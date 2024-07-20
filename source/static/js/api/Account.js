import HTTP from './http.js'

export async function attemptLogin() {
	const token42 = JSON.parse(sessionStorage.getItem('token42'));
	const url = `http://localhost:8000/oauth/login/callback/?code=${encodeURIComponent(token42)}`;

	return	HTTP.get(url)
				.then(response => {
					if (response.code == 'ok') {
						if (sessionStorage.getItem('isLoggedIn') == 'false') {

							sessionStorage.setItem('isLogging', false);
							sessionStorage.setItem('isLoggedIn', true);
	
							sessionStorage.setItem('player_name', JSON.stringify(response.data.detail.name));
							sessionStorage.setItem('player_image', JSON.stringify(response.data.detail.image));
							sessionStorage.setItem('access_token', JSON.stringify(response.data.detail.access_token));
							sessionStorage.setItem('refresh_token', JSON.stringify(response.data.detail.refresh_token));
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
	const access_token = JSON.parse(sessionStorage.getItem('access_token'));
	const url = `http://localhost:8000/oauth/login/callback/`;
	const header = {
		Authorization: `${access_token}`,
	}

	return	HTTP.get(url, header)
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
