const request = async (params) => {
	const { method = 'GET', url, headers = {}, body} = params;

	const config = {
		method,
		headers: new window.Headers(headers),
	}

	if (body)
		config.body = JSON.stringify(body);

	const response = await window.fetch(url, config).catch(error => console.log(error));

	return await response.json();
}

export default async function get(url, headers) {
	const response = await request({
		url,
		headers,
		method: 'GET',
	});

	return response;
}

// const post = async (url, body, headers) => {
// 	const response = await request({
// 		url,
// 		headers,
// 		method: 'POST',
// 		body,
// 	});

// 	return response;
// }

// const put = async (url, body, headers) => {
// 	const response = await request({
// 		url,
// 		headers,
// 		method: 'PUT',
// 		body,
// 	});

// 	return response;
// }

// const patch = async (url, body, headers) => {
// 	const response = await request({
// 		url,
// 		headers,
// 		method: 'PATCH',
// 		body,
// 	});

// 	return response;
// }

// const deleteRequest = async (url, headers) => {
// 	const response = await request({
// 		url,
// 		headers,
// 		method: 'DELETE',
// 	});

// 	return response;
// }

// export default {
// 	get,
// 	post,
// 	put,
// 	patch,
// 	delete: deleteRequest,
// };