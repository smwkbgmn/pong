import Component from '../../../core/Component.js'

export default class SetNameAI extends Component {
	setUp() {
		this.$state = {
			errorMessage: '',
		}
	}

	template() {
		const { errorMessage } = this.$state;

		return `
			<link rel="stylesheet" href="./style/Home.css">
			<link rel="stylesheet" href="./style/setting/local/SetNameAI.css">
			
			<div class="main-box">
				<p class="main-text">이름 설정</p>

				<div class="set-box">
					<div class="set-wrap">
						<p class="set-text">플레이어</p>
						<input class="set-input" type="text"</input>
					</div>
				</div>

				<p class="error-text">${errorMessage}</p>

				<button class="done-btn">완료</button>
			</div>
		`;
	}

	setEvent() {
		this.addEvent('click', '.done-btn', ({ target }) => {
			this.checkInput();
		});
	}

	checkInput() {
		const player_num = sessionStorage.getItem('player_num');

		let name = this.$target.querySelector('.set-input').value;
		console.log(name);

		if (name == '') {
			this.setErrorMessage();
			return ;
		}

		localStorage.setItem('player_name', JSON.stringify(name));
		// window.location.href = './#game_ai/';
	}

	setErrorMessage() {
		this.setState({ errorMessage: '이름을 설정해주세요.' });
	}
}
