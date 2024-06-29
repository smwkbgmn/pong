import Component from '../../core/Component.js'
import RoomList from '../../components/lobby/RoomList.js';

export default class LobbyPage extends Component {
	setUp() {
		const jsonString = localStorage.getItem('rooms');
		let array;

		if (jsonString == null) {
			array = [];
		}
		else
		array = JSON.parse(jsonString);
	
		this.$state = {
			roomList: array,
		};		
	}

	template() {
		return `
			<link rel="stylesheet" href="./style/lobby/Lobby.css">
			<link rel="stylesheet" href="./style/lobby/LobbyPage.css">

			<p class="room_list-text">방 목록</p>
			<button class="room_create-btn" data-bs-toggle="modal" data-bs-target="#room_create-modal">방 만들기</button>

			<div class="modal" id="room_create-modal" tabindex="-1" aria-labelledby="room_create-modal-Label" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered">
				<div class="modal-content">
					<div class="modal-body">

						<p class="title-text">방 제목</p>
						<input class="title-input">

						<p class="num-text">방 제목</p>
						<input class="num-input">

					</div>
					<div class="modal-footer">
						<button type="button" class="room_create_close-btn" style="background-color: rgba(0, 0, 0, 0)">만들기</button>
					</div>
				</div>
			</div>
			</div>
			

			<div data-component="room_list">
			</div>

			<div class="room1">
				<div class="line_row"></div>
				<div class="line_col"></div>
				<p class="room_title">방 제목</p>
				<p class="room_headcount">2/8</p>

				<p class="room_participant1">eunwolee</p>
				<p class="room_participant2">juyyang</p>
			</div>

			<div class="room2">
				<div class="line_row"></div>
				<div class="line_col"></div>
				<p class="room_title">방 제목</p>
				<p class="room_headcount">4/4</p>

				<p class="room_participant1">youjeong</p>
				<p class="room_participant2">juyyang</p>
				<p class="room_participant3">donghyu2</p>
			`;
	}

	mounted() {
		const $rooms = this.$target.querySelector(
			'[data-component="room_list"]'
		);
		new RoomList($rooms, this.$state);
	}

	setEvent() {
		this.addEvent('click', '.room_create_close-btn', ({target}) => {
			console.log('click btn');
			const { roomList } = this.$state;

			const title = target.closest('.modal-content').querySelector('.title-input').value;
			const num = target.closest('.modal-content').querySelector('.num-input').value;
			
			const newRoom = {
				title,
				num,
			}
			roomList.push(newRoom);

			const jsonString = JSON.stringify(roomList);
			localStorage.setItem('rooms', jsonString);
	
			const modalElement = target.closest('#room_create-modal');
			const modalInstance = bootstrap.Modal.getInstance(modalElement);
			modalInstance.hide();

			this.setState({ roomList });
		})
	}

	addRoom() {}
}