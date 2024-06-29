import Component from '../../core/Component.js'

export default class RoomList extends Component {
	template() {
		// console.log()
		// const roomList = this.props;
		// if (roomList.length == 0)
		// 	return ``;

		// return this.state.roomList.map((room, index) => {
		// 	participant = roomList.participants.map((participant, idx) => {
		// 		return `<p class-"room_participant${idx + 1}">${participant}</p>`;
		// 	}).join('');

		// 	return `
		// 		<div class="room${index + 1}">
		// 			<div class="line_row"></div>
		// 			<div class="line_col"></div>
		// 			<p class="room_title">${room.title}</p>
		// 			<p class="room_headcount">${room.headcount}</p>
		// 			${participantHtml}
		// 		</div>
		// 	`;
		// }).join('');
	}

	// setEvent() {
	// 	this.addEvent('click', '.room_create_close-btn', ({target}) => {
	// 		console.log('click btn');
	// 		const prev = this.$props;
	// 		this.modifyRoomList(target, prev);
	// 	})
	// }

	// addRoom(target, prev) {
	// 	const title = target.closest('.modal-content').querySelector('.title-text').value;
	// 	const newRoom = {
	// 		title,
	// 	}
	// 	prev.push(newRoom);
	// 	const jsonString = JSON.stringify(prev);
	// 	localStorage.setItem('rooms', jsonString);

	// 	const modalElement = target.closest('.room_create-madal');
	// 	const modalInstance = bootstrap.Modal.getInstance(modalElement);
   	// 	modalInstance.hide();


	// 	this.setState({ roomList: prev });
	// }
}
