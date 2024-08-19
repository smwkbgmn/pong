const request = async (params) => {
	const { method = 'GET', url, headers = {}, body} = params;

	const config = {
		method,
		headers: new window.Headers(headers),
	}

	if (body)
		config.body = JSON.stringify(body);

	return await window.fetch(url, config);
}

export default async function get(url, headers) {
	const response = await request({
		url,
		headers,
		method: 'GET',
	});

	return response;
}
