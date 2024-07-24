import Component from '../../../core/Component.js'
import * as Utils from '../../../Utils.js'

export default class SetNameTournament extends Component {
	setUp() {
		this.$state = {
			playerNum: Utils.getParsedItem('playerNum'),

			errorMessage: '',

			settingDone: false,
		}

		this.$state.settingDone = this.$state.playerNum != null;
	}

	template() {
		const { settingDone, playerNum, errorMessage } = this.$state;
			
		if (settingDone == false) {
			Utils.changeFragment('#/');
			return ``;
		}
		
		let inputHTML = '';
		for(let i = 0; i < playerNum; i++) {
			inputHTML += `
				<div class="set-wrap">
					<p class="set-p">플레이어 ${i + 1}</p>
					<input class="set-input set${i + 1}"></input>
				</div>
			`;
		}

		return `			
			<div class="main-div">
				<a class="home-a" href="#/">
					<img class="home-img" src="/static/asset/home-icon.png">
				</a>
				
				<p class="main-p">이름 설정</p>

				<div class="set-div">
					${inputHTML}
				</div>

				<p class="error-p">${errorMessage}</p>

				<button class="done-btn">완료</button>
			</div>
		`;
	}

	setEvent() {
		Event.addEvent('click', '.done-btn', ({ target }) => {
			this.checkInput();
		});
	}

	checkInput() {
		const playerNum = Utils.getParsedItem('playerNum');
		let name = [];

		for(let i = 0; i < playerNum; i++) {
			let tmp = this.$target.querySelector('.set' + (i + 1)).value;

			console.log(tmp);

			if (tmp == '') {
				this.setErrorMessage('이름을 설정해주세요.');
				return ;
			}
			else if (tmp.length > 8) {
				this.setErrorMessage('영문/한글/숫자 8자<br>이내로 설정해주세요.');
				return ;
			}
			else if (this.checkInvalidCharacter(tmp) == true) {
				this.setErrorMessage('영문/한글/숫자 8자<br>이내로 설정해주세요.');
				return ;
			}
			name.push(tmp);
		}

		Utils.setStringifiedItem('playerNames', name);
		Utils.changeFragment('#game_tournament/');
	}

	checkInvalidCharacter(name) {
		const chars = /[^0-9a-zA-Z가-힣]/;
		return chars.test(name);
	}

	setErrorMessage(msg) {
		this.setState({ errorMessage: msg });
	}
}
