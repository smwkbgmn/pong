import Component from '../../core/Component.js'
import * as Event from '../../core/Event.js'
import * as Utils from '../../Utils.js'

export default class SetNameTournament extends Component {
	setUp() {
		this.$state = {
			errorMessage: '',
		}
		
		this.playerNum = Utils.getParsedItem('playerNum');
		this.settingDone = this.playerNum != null;
	}

	template() {
		const { errorMessage } = this.$state;
			
		if (this.settingDone == false) {
			Utils.changeFragment('#/');
			return ``;
		}
		
		let inputHTML = '';
		for(let i = 0; i < this.playerNum; i++) {
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
		this.unmountedBinded = Event.addHashChangeEvent(this.unmounted.bind(this));
		this.checkinputWrapped = Event.addEvent(this.$target, 'click', '.done-btn', this.checkInput.bind(this));
	}

	clearEvent() {
		Event.removeHashChangeEvent(this.unmountedBinded);
		Event.removeEvent(this.$target, 'click', this.checkinputWrapped);
	}

	checkInput() {
		let name = [];

		for (let i = 0; i < this.playerNum; i++) {
			let tmpName = this.$target.querySelector('.set' + (i + 1)).value;

			console.log(tmpName);

			if (tmpName == '') {
				this.setErrorMessage('이름을 설정해주세요.');
				return ;
			}
			else if (tmpName.length > 8) {
				this.setErrorMessage('영문/한글/숫자 8자<br>이내로 설정해주세요.');
				return ;
			}
			else if (this.checkInvalidCharacter(tmpName) == true) {
				this.setErrorMessage('영문/한글/숫자 8자<br>이내로 설정해주세요.');
				return ;
			}
			name.push(tmpName);
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
