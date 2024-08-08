import Pong from '../../components/Pong.js'

export async function showCountdown(pageHash, componentName) {
	for (let i = 3; i > 0; i--) {
		if (window.location.hash != pageHash)
			return false;
		this.setState({ countdown: i });
		setComponentStyle('display', componentName, 'block');
		await sleep(1000);
	}
	
	if (window.location.hash != pageHash)
		return false;

	setComponentStyle('display', componentName, 'none');
	return true;
}

export async function playGame($state, $target) {
	const $game = $target.querySelector(
		'[data-component="game-div"]'
	);

	const pong = new Pong($game, $state);
	return await waitForGameEnd(pong);
}

export function waitForGameEnd(pong) {
	return new Promise(resolve => {
		const intervalID = setInterval(() => {
			const value = pong.isGameEnd();
			if (value != '') {
				clearInterval(intervalID);
				resolve(value);
			}
		}, 100);
	})
}

export function setComponentStyle(componentStyle, componentName, value) {
	const $component = document.querySelector(componentName);

	$component.style[componentStyle] = value;
}

export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
