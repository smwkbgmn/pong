export default class Component {
	$target;
	$props;
	$state;

	constructor($target, $props) {
		this.$target = $target;
		this.$props = $props;
		
		this.setUp();		// 컴포넌트 상태 설정
		this.setEvent();	// 컴포넌트에서 발생할 이벤트 설정
		this.render();		// UI 렌더링
	}

	setUp() {}

	mounted() {}

	unmounted() {
		this.clearEvent();
	}

	template() {
		return ``;
	}

	render() {
		this.$target.innerHTML = this.template();
		this.mounted();
	}

	setEvent() {}

	clearEvent() {}

	setState(newState) {
		this.$state = { ...this.$state, ...newState };
		this.render();
	}
}