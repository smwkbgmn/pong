export function getParsedItem(key) {
	const value = sessionStorage.getItem(key);
	return JSON.parse(value);
}

export function setStringifiedItem(key, value) {
	const stringifiedValue = JSON.stringify(value);
	sessionStorage.setItem(key, stringifiedValue);
}

export function removeItem(key) {
	sessionStorage.removeItem(key);
}

export function changeURL(url) {
	window.location.href = url;
}

export function changeFragment(fragment) {
	window.location.hash = fragment;
}