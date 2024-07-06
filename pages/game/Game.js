import Component from '../../core/Component.js'
import * as THREE from 'three';
import Matter from 'matter-js';

export default class PongGame extends Component {
	template() {
		return ``;
	}

	setUp() {
		this.$state = {
			isSetup: true,
		}

		this.setupThreeJS();
        this.setupPhysics();
        this.setupInputs();

		this.isRunning = true;

        this.animate();
	}

	setEvent() {
		window.addEventListener('hashchange', () => {
			if (window.location.hash != '#game_ai/') {
				console.log("stopping game");
				this.stopGame();
				this.cleanup();
			}
		})
	}

    setupThreeJS() {
        this.gameScene = new THREE.Scene();

        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 10;
        this.gameCamera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 0.1, 1000);
        this.gameCamera.position.z = 5;

        this.gameRenderer = new THREE.WebGLRenderer({ alpha: true });
        this.gameRenderer.setClearColor(0x000000, 0);
        this.gameRenderer.setSize(window.innerWidth, window.innerHeight);
        this.gameRenderer.domElement.style.position = 'absolute';
        this.gameRenderer.domElement.style.top = '0px';
        document.body.appendChild(this.gameRenderer.domElement);

        this.gameObjects = new Map();
    }

    setupPhysics() {
        this.engine = Matter.Engine.create();
        this.engine.world.gravity.y = 0;

        this.leftPaddle = this.createPaddle(-4.5, 0);
        this.rightPaddle = this.createPaddle(4.5, 0);
        this.ball = this.createBall();

        // this.createWall(0, -5, 10, 0.1);
        // this.createWall(0, 5, 10, 0.1);

        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            for (let i = 0, j = pairs.length; i != j; ++i) {
                const pair = pairs[i];
                if (pair.bodyA === this.ball.body || pair.bodyB === this.ball.body) {
                    const velocity = this.ball.body.velocity;
                    Matter.Body.setVelocity(this.ball.body, {
                        x: velocity.x * -1.02,
                        y: velocity.y * 1.02
                    });
                }
            }
        });
    }

    createPaddle(x, y) {
        const paddleBody = Matter.Bodies.rectangle(x, y, 0.2, 1, { isStatic: true });
        Matter.World.add(this.engine.world, paddleBody);

        const paddleGeometry = new THREE.PlaneGeometry(0.2, 1);
        const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const paddleMesh = new THREE.Mesh(paddleGeometry, paddleMaterial);

        this.gameScene.add(paddleMesh);
        this.gameObjects.set(paddleBody, paddleMesh);

        return { body: paddleBody, mesh: paddleMesh };
    }

    createBall() {
        const ballBody = Matter.Bodies.circle(0, 0, 0.1, {
            restitution: 1,
            frictionAir: 0,
            friction: 0,
            inertia: Infinity,
        });
        Matter.World.add(this.engine.world, ballBody);

        const ballGeometry = new THREE.CircleGeometry(0.1, 32);
        const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);

        this.gameScene.add(ballMesh);
        this.gameObjects.set(ballBody, ballMesh);

        Matter.Body.setVelocity(ballBody, { x: 2, y: 1 });
		// Matter.Body.setVelocity(ballBody, { x: 0.5, y: 0.25 });

        return { body: ballBody, mesh: ballMesh };
    }

    createWall(x, y, width, height) {
        const wallBody = Matter.Bodies.rectangle(x, y, width, height, { isStatic: true });
        Matter.World.add(this.engine.world, wallBody);

        const wallGeometry = new THREE.PlaneGeometry(width, height);
        const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallMesh.position.set(x, y, 0);

        this.gameScene.add(wallMesh);
    }

    setupInputs() {
        document.addEventListener('keydown', (event) => {
            const moveDistance = 0.2;
            switch (event.key) {
                case 'w':
                    this.movePaddle(this.leftPaddle, moveDistance);
                    break;
                case 's':
                    this.movePaddle(this.leftPaddle, -moveDistance);
                    break;
                case 'ArrowUp':
                    this.movePaddle(this.rightPaddle, moveDistance);
                    break;
                case 'ArrowDown':
                    this.movePaddle(this.rightPaddle, -moveDistance);
                    break;
            }
        });
    }

    movePaddle(paddle, distance) {
        const newY = paddle.body.position.y + distance;
        if (newY > -4.5 && newY < 4.5) {
            Matter.Body.setPosition(paddle.body, { x: paddle.body.position.x, y: newY });
        }
    }

	stopGame() {
		this.isRunning = false;
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}
	}

	resumeGame() {
		if (!this.isRunning) {
			this.isRunning = true;
			this.animate();
		}
	}

	cleanup() {
        this.stopGame();
        if (this.gameRenderer && this.gameRenderer.domElement) {
            document.body.removeChild(this.gameRenderer.domElement);
        }
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        // Clear Three.js scene
        while(this.gameScene.children.length > 0){ 
            this.gameScene.remove(this.gameScene.children[0]); 
        }
        // Clear Matter.js world
        Matter.World.clear(this.engine.world);
        Matter.Engine.clear(this.engine);
        
        this.isSetup = false;
    }

    animate() {
		if (!this.isRunning) return;

		this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

        Matter.Engine.update(this.engine, 1000 / 60);

        for (let [body, mesh] of this.gameObjects) {
            mesh.position.set(body.position.x, body.position.y, 0);
            mesh.rotation.z = body.angle;
        }

        if (Math.abs(this.ball.body.position.x) > 5) {
            Matter.Body.setPosition(this.ball.body, { x: 0, y: 0 });
            // Matter.Body.setVelocity(this.ball.body, { x: 2 * (Math.random() > 0.5 ? 1 : -1), y: 1 * (Math.random() > 0.5 ? 1 : -1) });

			Matter.Body.setVelocity(this.ball.body, { 
				x: 0.03 * (Math.random() > 0.5 ? 1 : -1), 
				y: 0.01 * (Math.random() > 0.5 ? 1 : -1)
			});
        }

        this.gameRenderer.render(this.gameScene, this.gameCamera);
    }
}

// Usage
// const game = new PongGame();

// game.stopGame();