import Component from '../core/Component.js'

// const THREE = window.THREE;
const { GLTFLoader } = THREE;
const { OrbitControls } = THREE;

export default class Background extends Component {
	render() {
		/*** SCENE ***/
		const scene = new THREE.Scene();
		
		const texture = new THREE.TextureLoader();
		texture.load('./static/asset/3d/cloud.jpg', function(texture) {
			scene.background = texture;
		});
		
		const lightAmbient = new THREE.AmbientLight( 0xffffff, 0.15 );
		scene.add( lightAmbient );
		
		/*** CAMERA ***/
		let camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 200 );
		if (window.location.hash == '#game_tournament/' || window.location.hash == '#game_ai/')
			camera.position.set( 0, 0, 4.9 );
		else
			camera.position.set( 0, 0, 0.01 );
		camera.lookAt( 0, 0, 10 );

		const seeing = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
		seeing.position.z = 20;

		let activation = camera;

		/*** AUDIO ***/
		// const listener = new THREE.AudioListener();
		// camera.add(listener);

		// const bgSound = new THREE.Audio(listener);
		// const audioLoader = new THREE.AudioLoader();
		// audioLoader.load('../asset/bgm.mp3', function(buffer) {
		// 	bgSound.setBuffer(buffer);
		// 	bgSound.setLoop(true);
		// 	bgSound.setVolume(0.5);
		// 	bgSound.play();
 	 	// });

		// if (!window.audioContext) {
		// 	window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		// } else if (window.audioContext.state === 'suspended') {
		// 	window.audioContext.resume();
		// }

		/*** RENDERER ***/
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		/*** CONTROL - Orbit ***/
		const controls = new OrbitControls( camera, renderer.domElement );
		
		if (window.location.hash == '#game_tournament/' ||
			window.location.hash == '#game_ai/') {
			controls.target.set( 0, 0, 4.95 );
			controls.enabled = false;
		} else
			controls.target.set( 0, 0, 0.5 );

		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		
		controls.screenSpacePanning = false;
		
		setControlLimit();

		function setControlLimit() {
			controls.maxDistance = 1; 
			controls.minPolarAngle = Math.PI / 3;
			controls.maxPolarAngle = Math.PI / 1.5;
		}

		function unsetControlLimit() {
			controls.maxDistance = Infinity; 
			controls.minPolarAngle = 0;
			controls.maxPolarAngle = Math.PI;
		}

		/*** CONTROL - Tween ***/
		const cameraPositions = {
			"home": { x: 0.001, y: 0.001, z: 0.001 },
			"game": { x: 0.001, y: 0.001, z: 4.9 }
		};

		// function navigateToSection( section ) {
		// 	updateCameraForSection( section );
		// 	// Your SPA navigation logic here
		// }

		function getTargetPosition() {
			const section = window.location.hash;
			console.log( "in section: " + section );

			if (section == "#game_tournament/" ||
				section == "#game_ai/") {
				setCameraGame();
				return cameraPositions["game"];
			} else {
				setCameraHome();
				return cameraPositions["home"];
			}
		}
		
		function updateCameraForSection() {
			const targetPosition = getTargetPosition();

			animateCamera( targetPosition );
		}

		function animateCamera( targetPosition, duration = 2300 ) {
			new TWEEN.Tween( camera.position )
				.to( targetPosition, duration )
				.easing( TWEEN.Easing.Quadratic.InOut )
				.start();
				
			new TWEEN.Tween( controls.target )
				.to( {
					x: targetPosition.x,
					y: targetPosition.y,
					z: targetPosition.z + 0.1
				},
				duration)
				.easing( TWEEN.Easing.Quadratic.InOut )
				.onUpdate(() => controls.update())
				.start();
		}

		function setCameraHome() {
			camera.fov = 50;
			controls.enabled = true;
		}

		function setCameraGame() {
			camera.fov = 15;
			controls.enabled = false;
		}

		window.addEventListener( 'hashchange', updateCameraForSection );

		/*** LISTEN ***/
		window.addEventListener( 'resize', onWindowResize );
		document.addEventListener( 'keydown', onKeyDown );
		
		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			
			renderer.setSize( window.innerWidth, window.innerHeight );
		}

		function onKeyDown( event ) {
			switch ( event.keyCode ) {
				case 80: {
					if ( activation === camera ) {
						activation			= seeing;
						helper.visible		= true;
						arrowWorld.visible	= true;
						controls.object		= seeing;
						
						unsetControlLimit();
					} else {
						activation			= camera;
						helper.visible		= false;
						arrowWorld.visible	= false;
						controls.object		= camera;
						
						setControlLimit();
					}
					break;
				}
			}
		}
		
		/*** WORLD - Asset ***/
		const loader = new GLTFLoader();
		
		loader.load(
			// './static/asset/3d/classroom/classRoom_light.glb',
			'./static/asset/3d/school_class_room/scene.gltf',
			function ( gltf ) {
				gltf.scene.position.set( 96.55, -1.55, -13 );
				scene.add( gltf.scene );
			},
			function (xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
			function (error) { console.error('An error happened', error); }
		);

		// 0.9, 1.2
		/*** WORLD - Lights ***/
		const frontLeft = new THREE.DirectionalLight( 0xffffff, 0.28 );
		const frontMid = new THREE.DirectionalLight( 0xffffff, 0.28 );
		const frontRight = new THREE.DirectionalLight( 0xffffff, 0.28 );
		frontLeft.position.set( -0.5, 0.2, -0.2 );
		frontLeft.position.set( 0, 0.2, -0.2 );
		frontRight.position.set( 0.5, 0.2, -0.2 );
		scene.add( frontLeft );
		scene.add( frontMid );
		scene.add( frontRight );
		
		const rearLeft = new THREE.DirectionalLight( 0xffffff, 0.28 );
		const rearMid = new THREE.DirectionalLight( 0xffffff, 0.28 );
		const rearRight = new THREE.DirectionalLight( 0xffffff, 0.28 );
		rearLeft.position.set( -0.5, 0.2, 0.4 );
		rearMid.position.set( 0, 0.2, 0.4 );
		rearRight.position.set( 0.5, 0.2, 0.4 );
		scene.add( rearLeft );
		scene.add( rearMid );
		scene.add( rearRight ); 
		
		const hemi = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.5 );
		hemi.position.set( 0, 0, 0 );
		scene.add( hemi );

		/*** WORLD - Helper ***/
		const helper = new THREE.CameraHelper( camera );
		helper.visible = false;
		scene.add( helper );
		
		// const hemiHelper = new THREE.HemisphereLightHelper( hemi, 5 );
		// scene.add( hemiHelper );

		const arrowWorld = new THREE.AxesHelper( 2 );
		arrowWorld.visible = false;
		scene.add( arrowWorld );

		/*** SHOOT ***/
		function animate() {
			controls.update();
			TWEEN.update();
			activation.updateMatrixWorld();
			
			render();
		}
		
		function render() { renderer.render( scene, activation ); }
		
		/*
			The renderer.setAnimationLoop(animate) call is
			Three.js's way of using requestAnimationFrame internally,
			which is equivalent to calling requestAnimationFrame(animate) directly.
		*/

		// requestAnimationFrame( animate );
		renderer.setAnimationLoop( animate );
	}
}
