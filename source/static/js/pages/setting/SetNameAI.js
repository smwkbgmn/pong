import Component from '../../core/Component.js'
import * as Event from '../../core/Event.js'
import * as Utils from '../../Utils.js'

export default class SetNameAI extends Component {
	setUp() {
		this.$state = {
			errorMessage: '',
		}
	}

	template() {
		const { errorMessage } = this.$state;

		return `			
			<div class="main-div">
				<a class="home-a" href="#/">
					<img class="home-img" src="/static/asset/home-icon.png">
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
		this.unmountedBinded = Event.addHashChangeEvent(this.unmounted.bind(this));
		this.checkinputWrapped = Event.addEvent(this.$target, 'click', '.done-btn', this.checkInput.bind(this));
	}

	clearEvent() {
		Event.removeHashChangeEvent(this.unmountedBinded);
		Event.removeEvent(this.$target, 'click', this.checkinputWrapped);
	}

	checkInput() {
		const player_num = Utils.getParsedItem('playerNum');

		let name = this.$target.querySelector('.set-input').value;

		if (name == '') {
			this.setErrorMessage('이름을 설정해주세요.');
			return ;
		}
		else if (name.length > 8) {
			this.setErrorMessage('영문/한글/숫자 8자<br>이내로 설정해주세요.');
			return ;
		}
		else if (this.checkInvalidCharacter(name) == true) {
			this.setErrorMessage('영문/한글/숫자 8자<br>이내로 설정해주세요.');
			return ;
		}

		Utils.setStringifiedItem('playerName', name);
		Utils.changeFragment('#game_ai/');
	}

	checkInvalidCharacter(name) {
		const chars = /[^0-9a-zA-Z가-힣]/;
		return chars.test(name);
	}

	setErrorMessage(msg) {
		this.setState({ errorMessage: msg });
	}
}
