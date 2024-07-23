export default class Component {
	$target;
	$props;
	$state;

	constructor($target, $props) {
		this.$target = $target;
		this.$props = $props;
		
		this.setUp();		// 컴포넌트 상태 설정
		this.render();		// UI 렌더링
		this.setEvent();	// 컴포넌트에서 발생할 이벤트 설정
	}

	setUp() {}

	mounted() {}

	unmounted() {}

	template() {
		return ``;
	}

	render() {
		this.$target.innerHTML = this.template();
		this.mounted();
	}

	setEvent() {}

	setState(newState) {
		this.$state = { ...this.$state, ...newState };
		this.render();
		// this.setEvent();
	}

	// addEvent(eventType, selector, callback) {
	// 	console.log(callback);
	// 	this.$target.addEventListener(eventType, (event) => {
	// 		if (!event.target.closest(selector))
	// 			return false;
	// 		callback(event);
	// 	})
	// }

	addEvent(eventType, selector, callback) {
		const $element = this.$target.querySelector(selector);

		$element.addEventListener(eventType, callback);
	}

	removeEvent(eventType, selector, callback) {
		const $element = this.$target.querySelector(selector);

		$element.removeEventListener(eventType, callback);
	}
}