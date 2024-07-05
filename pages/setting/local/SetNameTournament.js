import Component from '../../../core/Component.js'

export default class SetNameTournament extends Component {
	setUp() {
		this.$state = {
			errorMessage: '',
		}
	}

	template() {
		const player_num = sessionStorage.getItem('player_num');
		const { errorMessage } = this.$state;
		
		let inputHTML = '';
		for(let i = 0; i < player_num; i++) {
			inputHTML += `
				<div class="set-wrap">
					<p class="set-text">플레이어 ${i + 1}</p>
					<input class="set-input set${i + 1}" type="text"</input>
				</div>
			`;
		}

		return `
			<link rel="stylesheet" href="./style/Home.css">
			<link rel="stylesheet" href="./style/setting/local/SetNameTournament.css">
			
			<div class="main-box">
				<p class="main-text">이름 설정</p>

				<div class="set-box">
					${inputHTML}
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
		let name = [];

		for(let i = 0; i < player_num; i++) {
			let tmp = this.$target.querySelector('.set' + (i + 1)).value;

			if (tmp == '') {
				this.setErrorMessage();
				return ;
			}
			name.push(tmp);
		}

		localStorage.setItem('player_name', JSON.stringify(name));
		window.location.href = './#game_tournament/';
	}

	setErrorMessage() {
		this.setState({ errorMessage: '이름을 설정해주세요.' });
	}
}
