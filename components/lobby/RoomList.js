import Component from '../../core/Component.js'

export default class RoomList extends Component {
	template() {
		const { roomList } = this.$props;
		console.log(roomList);
		if (roomList.length == 0)
			return ``;

		return roomList.map((room, index) => {
			// participant = roomList.participants.map((participant, idx) => {
			// 	return `<p class-"room_participant${idx + 1}">${participant}</p>`;
			// }).join('');

			return `
				<div class="room${index + 1}">
					<div class="line_row"></div>
					<div class="line_col"></div>
					<p class="room_title">${room.title}</p>
					<p class="room_headcount">${room.headcount}</p>
					</div>
					`;
					// ${participantHtml}
		}).join('');
	}
}
