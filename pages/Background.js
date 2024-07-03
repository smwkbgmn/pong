import Component from '../core/Component.js'
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

/*
	gltf.animations;	Array<THREE.AnimationClip>
	gltf.scene;			THREE.Group
	gltf.scenes;		Array<THREE.Group>
	gltf.cameras;		Array<THREE.Camera>
	gltf.asset;			Object
*/

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ArrowHelper } from 'three';



export default class Three extends Component {
	render() {
		/*** SCENE ***/
		const scene = new THREE.Scene();
		
		const texture = new THREE.TextureLoader();
		texture.load('../../design_src/3d/cloud.jpg', function(texture) {
			scene.background = texture;
		});
		
		const lightAmbient = new THREE.AmbientLight( 0xffffff, 0.35 );
		scene.add( lightAmbient );

		
		/*** CAMERA ***/
		let camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100 );
		camera.lookAt( 0, 0, 10 );

		const seeing = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
		seeing.position.z = 20;

		let activation = camera;

		/*** RENDERER ***/
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );


		/*** CONTROL - Orbit ***/
		const controls = new OrbitControls( camera, renderer.domElement );
		// const controls = new OrbitControls( seeing, renderer.domElement );

		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		
		controls.screenSpacePanning = false;
		
		controls.minDistance = 0;
		controls.maxDistance = 1; 
		controls.minPolarAngle = Math.PI / 3;
		controls.maxPolarAngle = Math.PI / 1.5;


		/*** CONTROL - Tween ***/
		const cameraPositions = {
			"/": { x: 0.001, y: 0.001, z: 0.001 },
			"lobby/": { x: 0.001, y: 0.001, z: 4.9 }
		};

		function onSPANavigation( event ) {
			const section = event.detail.section; 
			updateCameraForSection( section );
		}

		// function navigateToSection( section ) {
		// 	updateCameraForSection( section );
		// 	// Your SPA navigation logic here
		// }
		
		function updateCameraForSection( section ) {
			const targetPosition = cameraPositions[section];

			console.log( "in section: " + section );

			if ( targetPosition ) {
				if ( section === "/" ) { setCameraHome(); }
				else { setCameraLobby(); }

				animateCamera( targetPosition );
				console.log( camera.position );
			}
		}

		function animateCamera( targetPosition, duration = 2300 ) {
			new TWEEN.Tween( camera.position )
				.to( targetPosition, duration )
				.easing( TWEEN.Easing.Quadratic.InOut )
		
				// .onComplete(() => {
				// 	camera.position.x = Math.round(camera.position.x * 100) / 100;
				// 	camera.position.y = Math.round(camera.position.y * 100) / 100;
				// 	camera.position.z = Math.round(camera.position.z * 100) / 100;
				// 	console.log("Rounded camera position after tween:", camera.position);
				// })

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

		function setCameraLobby() {
			camera.fov = 15;
			controls.enabled = false;
		}

		document.addEventListener( 'spaNavigate', onSPANavigation );


		/*** LISTEN ***/
		window.addEventListener( 'resize', onWindowResize );
		// document.addEventListener( 'hashchange', onSPANavigation );
		document.addEventListener( 'keydown', onKeyDown );
		
		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			
			renderer.setSize( window.innerWidth, window.innerHeight );
		}

		// window.addEventListener( 'resize', () => {
		// 	camera.aspect = window.innerWidth / window.innerHeight;
		// 	camera.updateProjectionMatrix();
		// 	renderer.setSize( window.innerWidth, window.innerHeight );
		// });

		function onKeyDown( event ) {
			switch ( event.keyCode ) {
				case 80:

					if ( activation === camera ) {
						activation = seeing;
						helper.visible = true;
						// arrow.visible = true;
						arrowWorld.visible = true;
						controls.object = seeing;
					}

					else {
						activation = camera;
						helper.visible = false;
						// arrow.visible = false;
						arrowWorld.visible = false;
						controls.object = camera;
					}

					break;
			}
		}


		
		
		/*** WORLD - Asset ***/
		const loader = new GLTFLoader();
		
		loader.load(
			'../../design_src/3d/school_class_room/scene.gltf',
		
			function ( gltf ) {
		
				gltf.scene.position.set( 96.55, -1.55, -13 );
				scene.add( gltf.scene );
		
			},
			function (xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
			function (error) { console.error('An error happened', error); }
		);


		/*** WORLD - Lights ***/
		const frontLeft = new THREE.DirectionalLight( 0xffffff, 0.9 );
		const frontMid = new THREE.DirectionalLight( 0xffffff, 0.9 );
		const frontRight = new THREE.DirectionalLight( 0xffffff, 0.9 );
		frontLeft.position.set( -0.5, 0.2, -0.2 );
		frontLeft.position.set( 0, 0.2, -0.2 );
		frontRight.position.set( 0.5, 0.2, -0.2 );
		scene.add( frontLeft );
		scene.add( frontMid );
		scene.add( frontRight );
		
		
		const rearLeft = new THREE.DirectionalLight( 0xffffff, 0.9 );
		const rearMid = new THREE.DirectionalLight( 0xffffff, 0.9 );
		const rearRight = new THREE.DirectionalLight( 0xffffff, 0.9 );
		rearLeft.position.set( -0.5, 0.2, 0.4 );
		rearMid.position.set( 0, 0.2, 0.4 );
		rearRight.position.set( 0.5, 0.2, 0.4 );
		scene.add( rearLeft );
		scene.add( rearMid );
		scene.add( rearRight ); 
		
		const hemi = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.2 );
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

		// function createArrow( camera ) {
		// 	const axesHelper = new THREE.Group();
		
		// 	const length = 1;
		
		// 	const xArrow = new THREE.ArrowHelper(
		// 		new THREE.Vector3(1, 0, 0),
		// 		new THREE.Vector3(0, 0, 0),
		// 		length,
		// 		0x0000ff
		// 	);
		// 	axesHelper.add(xArrow);
		
		// 	const yArrow = new THREE.ArrowHelper(
		// 		new THREE.Vector3(0, 1, 0),
		// 		new THREE.Vector3(0, 0, 0),
		// 		length,
		// 		0x00ff00
		// 	);
		// 	axesHelper.add(yArrow);
		
		// 	const zArrow = new THREE.ArrowHelper(
		// 		new THREE.Vector3(0, 0, 1),
		// 		new THREE.Vector3(0, 0, 0),
		// 		length,
		// 		0xff0000
		// 	);
		// 	axesHelper.add(zArrow);
		
		// 	axesHelper.visible = false;
		// 	scene.add(axesHelper);
		
		// 	return axesHelper;
		// }

		// const arrow = createArrow( camera );
		
		
		/*** SHOOT ***/
		function animate() {
			
			TWEEN.update();
			controls.update();
			camera.updateMatrixWorld();
			
			// arrow.position.copy( camera.position );
			// arrow.quaternion.copy( camera.quaternion );
			
			render();

		}
		
		function render() {
			renderer.render( scene, activation );
			// renderer.render( scene, camera );
			// renderer.render( scene, seeing );
		}
		
		/*
		 *	The renderer.setAnimationLoop(animate) call is
		 *	Three.js's way of using requestAnimationFrame internally,
		 *	which is equivalent to calling requestAnimationFrame(animate) directly.
		 */

		// requestAnimationFrame( animate );
		renderer.setAnimationLoop( animate );
	}
}