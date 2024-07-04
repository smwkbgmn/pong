import Component from '../../../core/Component.js'

export default class WaitingPlayer extends Component {
	setUp() {
		this.$state = {
			idx: 2,
			start: new Date().getSeconds(),
			timer: 0,
		};

		this.changeMsg(this.$state.idx);
	}
	
	template() {
		const { idx } = this.$state;
		const textList = [
			'다른 참가자를 기다리는 중입니다.',
			'다른 참가자를 기다리는 중입니다..',
			'다른 참가자를 기다리는 중입니다...'
		]

		return `
			<link rel="stylesheet" href="./style/Common.css">
			<link rel="stylesheet" href="./style/game/online/WaitingPlayer.css">
			
			<div class="main-box">
				<p class="main-text">토너먼트</p>

				<p class="message-text">${textList[idx]}</p>
				
				<a href="#mode_tournament/" class="exit-a">돌아가기</a>
			</div>
		`;
	}

	setEvent() {
		window.addEventListener('hashchange', () => 
			clearTimeout(this.$state.timer));
	}

	changeMsg(prev) {
		const { start } = this.$state;
		
		if (new Date().getSeconds() - start < 3) {
			this.setState({ idx: (prev + 1) % 3 });
			this.$state.timer = setTimeout(this.changeMsg.bind(this, this.$state.idx), 800);
		}
		else
			window.location.href = './#game_tournament/';
	}
}
