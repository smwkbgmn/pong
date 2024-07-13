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
			
			<div class="main-div">
				<a class="home-a" href="#/">
					<img class="home-img" src="./asset/home-icon.png">
				</a>
				
				<p class="main-p">이름 설정</p>

				<div class="set-div">
					<div class="set-wrap">
						<p class="set-p">플레이어</p>
						<input class="set-input"></input>
					</div>
				</div>

				<p class="error-p">${errorMessage}</p>

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

		if (name == '') {
			this.setErrorMessage('이름을 설정해주세요.');
			return ;
		}
		else if (name.length > 10) {
			this.setErrorMessage('영문/한글/숫자 10자 이내로 설정해주세요.');
			return ;
		}
		else if (this.checkInvalidCharacter(name) == true) {
			this.setErrorMessage('영문/한글/숫자 10자 이내로 설정해주세요.');
			return ;
		}

		localStorage.setItem('player_name', JSON.stringify(name));
		window.location.href = './#game_ai/';
	}

	checkInvalidCharacter(name) {
		const chars = /[^0-9a-zA-Z가-힣]/;
		return chars.test(name);
	}

	setErrorMessage(msg) {
		this.setState({ errorMessage: msg });
	}
}
