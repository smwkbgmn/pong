import Component from '../core/Component.js'
import * as Event from '../core/Event.js'
import * as THREE from 'three';
import * as GameUtils from "../pages/game/GameUtils.js"

export default class Pong extends Component {
	constructor($target, $props) {
		super($target, $props);

		this.animate();
	}

	template() {
		const { scoreLeft, scoreRight } = this.$state;
		const { playerNameLeft, playerNameRight } = this.$props;

		const result = scoreLeft > scoreRight ? playerNameLeft + ' 승리' : playerNameRight + ' 승리';

		let button;
		if (this.$props.lastGame == true)
			button = '다시하기';
		else
			button = '다음 게임';

		return `
			<p class="score-p">${scoreLeft} : ${scoreRight}</p>
			
			<div class="result-div">
				<p class="result-p">게임 결과</p>
				<p class="win_or_lose-p">${result}</p>
				<button class="restart-btn">${button}</button>
			</div>
		`;
	}

	setUp() {
		this.$state = {
			isSetup: true,
			scoreLeft: 0,
			scoreRight: 0,
		}
		
		this.isRunning = true;
		this.endReturnValue = '';
		
		this.ballDirection = { x: 1, y: 1 };
		// this.ballSpeedDefault = 0.07;
		this.ballSpeedDefault = 0.9;
		this.ballSpeed = this.ballSpeedDefault;
		// this.ballSpeedIncreament = 0.09;
		this.ballSpeedIncreament = 0.11;
		this.ballTimeScale = 0.05;
		
		this.paddleMoveDistance = 0.7;
		this.paddleRandomBounceScale = 0.35; // (rand -50 ~ +50)% * 0.2 = (-10 ~ +10)% modulation
		
		this.aiMode = this.$props.aiMode; // on == AI, off == local tournament
		this.aiUpdateInterval = 1000; // ms
		this.aiMoveInterval = 80; // ms
		// this.aiErrorMargin = 0.05; // AI has a 50% chance to make a "mistake"

		this.aiLastUpdate = 0;
		this.aiLastMove = 0;
		this.aiTargetY = 0;
		
		this.setupThreeJS();
        this.setupPhysics();
        this.setupListener();
	}

	setEvent() {
		this.hashChangedBinded = Event.addHashChangeEvent(this.hashChanged.bind(this));
		this.clickedRestartButtonWrapped = Event.addEvent(this.$target, 'click', '.restart-btn', this.clickedRestartButton.bind(this));
	}

	clearEvent() {
		Event.removeHashChangeEvent(this.hashChangedBinded);
		Event.removeEvent(this.$target, 'click', this.clickedRestartButtonWrapped);
	}
	
	hashChanged() {
		this.clearEvent();
		if (window.location.hash != '#game_ai/') {
			this.stopGame();
			this.cleanup();
		}
	}
	
	clickedRestartButton() {
		this.cleanup();
		this.endReturnValue = this.$state.scoreLeft > this.$state.scoreRight
							? this.$props.playerNameLeft : this.$props.playerNameRight;
	}

	isGameEnd() {
		return this.endReturnValue;
	}
	
	/*** SETUP ***/
	setupThreeJS() {
		this.gameScene = new THREE.Scene();

		const aspect = window.innerWidth / window.innerHeight;
		const frustumSize = 10;
		this.gameCamera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 0.1, 1000);
		this.gameCamera.position.z = 5;

		this.gameRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		this.gameRenderer.setClearColor(0x000000, 0);
		this.gameRenderer.setSize(window.innerWidth, window.innerHeight);
		this.gameRenderer.domElement.style.position = 'absolute';
		this.gameRenderer.domElement.style.top = '0px';
		document.body.appendChild(this.gameRenderer.domElement);

		this.gameObjects = new Map();
	}

	setupPhysics() {
		this.engine = Matter.Engine.create({
			gravity: { x: 0, y: 0, scale: 0 }
		});
		// this.engine.gravity.y = 0;

		// See this issue for the colision configs on Matter
		// https://github.com/liabru/matter-js/issues/394
		Matter.Resolver._restingThresh = 0.001;
		// Matter.Resolver._restingThresh = 0;

		this.ball = this.createBall();
		this.resetBall();

		this.paddleLeft = this.createPaddle(-5.5, 0);
		this.paddleRight = this.createPaddle(5.5, 0);

		this.wallUp = this.createWall(0, -5, 10, 0.1);
		this.wallDown = this.createWall(0, 5, 10, 0.1);

		Matter.Events.on(this.engine, 'collisionEnd', (event) => this.handleCollision(event));
	}

	handleCollision(event) {
		const pair = event.pairs[0];
		if (pair.bodyA.label === "ball" || pair.bodyB.label === "ball") {
			const direction = {
				x: this.ball.body.velocity.x / this.ballSpeed,
				y: this.ball.body.velocity.y / this.ballSpeed,
			};
			
			if (pair.bodyA.label === "paddle" || pair.bodyB.label === "paddle") {
				// this.audioLoader.play();

				const mod = 1 + ((Math.random() - 0.5) * this.paddleRandomBounceScale); 
				direction.y *= mod;
				
				// this.updateBallVelocity(this.ball.body, direction);
			}
			if (!this.aiMode)
				this.ballSpeed *= (1 + this.ballSpeedIncreament);
			// Matter.Body.setSpeed(this.ball.body, this.ballSpeed);
			this.updateBallVelocity(this.ball.body, direction);
		}
	}

	updateBallVelocity(ballBody, direction) {
		const velocity = {
			x: direction.x * this.ballSpeed,
			y: direction.y * this.ballSpeed
		};
		Matter.Body.setVelocity(ballBody, velocity);
	}

	setupListener() {
		document.addEventListener('keydown', this.handleKeyDownHolder = this.handleKeyDown.bind(this));
		window.addEventListener('resize', this.handleResizeHolder = this.handleWindowResize.bind(this));
	}

	handleKeyDown(event) {
		switch (event.key) {
			case 'w'			: this.movePaddle(this.paddleLeft, this.paddleMoveDistance); break;
			case 's'			: this.movePaddle(this.paddleLeft, -this.paddleMoveDistance); break;
			case 'ArrowUp'		: if (!this.aiMode) this.movePaddle(this.paddleRight, this.paddleMoveDistance); break;
			case 'ArrowDown'	: if (!this.aiMode) this.movePaddle(this.paddleRight, -this.paddleMoveDistance); break;

			// case 'o':
			// 	if (this.isRunning) this.stopGame();
			// 	else this.resumeGame();
			// 	break;
			
			// case 'i':
			// 	this.aiMode = !this.aiMode;
			// 	console.log("AI mode: " + (this.modeAI? "ON" : "OFF"));
			// 	break;
		}
	}

	handleWindowResize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		
		this.gameCamera.aspect = width / height;
		this.gameCamera.updateProjectionMatrix();
		
		this.gameRenderer.setSize(width, height);
	}
	
	/*** OBJ - Ball ***/
	createBall() {
		/*
			At collision, there is a issue at losing energt(velocity)
			Please see this. https://github.com/liabru/matter-js/issues/256
		*/
		const ballBody = Matter.Bodies.circle(0, 0, 0.1, {
			label: "ball",

			restitution: 1,
			frictionAir: 0,
			friction: 0,
			inertia: Infinity,
			inverseInertia: 1 / Infinity,
			// density: 1,
			slop: 0.01,
			timeScale: this.ballTimeScale
		});
		Matter.World.add(this.engine.world, ballBody);

		const ballGeometry = new THREE.CircleGeometry(0.1, 32);
		const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);

		this.gameScene.add(ballMesh);
		this.gameObjects.set(ballBody, ballMesh);

		return { body: ballBody, mesh: ballMesh };
	}

	resetBall() {
		Matter.Body.setPosition(this.ball.body, { x: 0, y: 0 });

		this.ballDirection = {
			x: Math.random() > 0.5 ? 1 : -1,
			y: (Math.random() - 0.5) * 2
		};

		const length = Math.sqrt(this.ballDirection.x ** 2 + this.ballDirection.y ** 2);
		this.ballDirection.x /= length;
		this.ballDirection.y /= length;
		this.ballSpeed = this.ballSpeedDefault;
		this.updateBallVelocity(this.ball.body, this.ballDirection);
	}

	/*** OBJ - Paddle ***/
	createPaddle(x, y) {
		const paddleBody = Matter.Bodies.rectangle(x, y, 0.2, 1, {
			label: "paddle",

			isStatic: true,
			restitution: 1,
			friction: 0,
			slop: 0.01,
			density: 1
		});
		Matter.World.add(this.engine.world, paddleBody);

		const paddleGeometry = new THREE.PlaneGeometry(0.2, 1);
		const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		const paddleMesh = new THREE.Mesh(paddleGeometry, paddleMaterial);
		paddleMesh.position.set(x, y, 0);

		this.gameScene.add(paddleMesh);
		this.gameObjects.set(paddleBody, paddleMesh);

		return { body: paddleBody, mesh: paddleMesh };
	}

	movePaddle(paddle, distance) {
		const newY = paddle.body.position.y + distance;
		if (newY > -4.5 && newY < 4.5)
			Matter.Body.setPosition(paddle.body, { x: paddle.body.position.x, y: newY });
	}

	aiMovePaddle() {
		const currentTime = Date.now();

		// Only update AI decision every aiUpdateInterval milliseconds
		if (currentTime - this.aiLastUpdate > this.aiUpdateInterval) {
			this.aiLastUpdate = currentTime;
			const ballY = this.ball.body.position.y;
			this.aiTargetY = ballY;

			// // Randomly decide whether to make a "mistake"
			// if (Math.random() > this.aiErrorMargin) this.aiTargetY = ballY;
			// // If making a "mistake", aim for a random position
			// else this.aiTargetY = (Math.random() - 0.5) * 8; // Random position between -4 and 4
		}

		if (currentTime - this.aiLastMove > this.aiMoveInterval) {
			this.aiLastMove = currentTime;

			const paddleY = this.paddleRight.body.position.y;
			const difference = this.aiTargetY - paddleY;

			if (Math.abs(difference) > 0.3) {
				const direction = difference > 0 ? 1 : -1;
				this.movePaddle(this.paddleRight, direction * this.paddleMoveDistance);
			}
		}
	}

	resetPaddle() {
		Matter.Body.setPosition(this.paddleLeft.body, {
			x: -5.5,
			y: 0,
			z: 0
		});
		Matter.Body.setPosition(this.paddleRight.body, {
			x: 5.5,
			y: 0,
			z: 0
		});
	}

	/*** OBJ - Wall ***/
	createWall(x, y, width, height) {
		const wallBody = Matter.Bodies.rectangle(x, y, width, height, {
			label: "wall",

			isStatic: true,
			restitution: 1,
			friction: 0,
			slop: 0.01,
			density: 1,
		});
		Matter.World.add(this.engine.world, wallBody);

		const wallGeometry = new THREE.PlaneGeometry(width, height);
		const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
		wallMesh.position.set(x, y, 0);

		this.gameScene.add(wallMesh);
		this.gameObjects.set(wallBody, wallMesh);

		return { body: wallBody, mesh: wallMesh };
	}

	/*** GAME UTILL ***/
	stopGame() {
		this.isRunning = false;
		if (this.animationFrameId)
			cancelAnimationFrame(this.animationFrameId);
	}

	resumeGame() {
		if (!this.isRunning) {
			this.isRunning = true;
			this.animate();
		}
	}

	cleanup() {
		if (this.gameRenderer && this.gameRenderer.domElement)
			document.body.removeChild(this.gameRenderer.domElement);

		document.removeEventListener('keydown', this.handleKeyDownHolder);
		window.removeEventListener('resize', this.handleResizeHoler);

		while(this.gameScene.children.length > 0)
			this.gameScene.remove(this.gameScene.children[0]); 

		Matter.World.clear(this.engine.world);
		Matter.Engine.clear(this.engine);
		
		this.isSetup = false;
	}


	/*** RENDER ***/
	animate() {
		this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

		// const currentTime = performance.now();
		// const delta = currentTime - this.lastTime;
		// this.lastTime = currentTime;
		
		// Matter.Engine.update(this.engine, delta);
		Matter.Engine.update(this.engine, 1000 / 60);

		for (let [body, mesh] of this.gameObjects) {
			mesh.position.set(body.position.x, body.position.y, 0);
			mesh.rotation.z = body.angle;
		}

		if (this.aiMode)
			this.aiMovePaddle();

		this.checkIfBallIsOutOfBounds();

		this.gameRenderer.render(this.gameScene, this.gameCamera);
	}

	checkIfBallIsOutOfBounds() {
		if (Math.abs(this.ball.body.position.x) > 6 || Math.abs(this.ball.body.position.y) > 5) {
			if (this.ball.body.position.x > 0)
				this.setState({ scoreLeft: this.$state.scoreLeft + 1});
			else if (this.ball.body.position.x < 0)
				this.setState({ scoreRight: this.$state.scoreRight + 1});
			
			if (this.$state.scoreLeft == 3 || this.$state.scoreRight == 3) {
				this.stopGame();
				GameUtils.setComponentStyle('display', '.result-div', 'block');
			}
			this.resetBall();
		}
	}
}