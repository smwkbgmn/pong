import Component from '../core/Component.js'
import * as THREE from 'three';
import * as CameraUtils from 'three/addons/utils/CameraUtils.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class Three extends Component {
	render() {
		console.log('render');
		
		/* RENDERER */
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		
		/* SCENE */
		const scene = new THREE.Scene();
		// scene.background = new THREE.Color( 0x333333 );
		
		// Load the background texture
		const texture = new THREE.TextureLoader();
		texture.load('../../design_src/3d/cloud.jpg', function(texture) {
			scene.background = texture;
		});
		
		const lightAmbient = new THREE.AmbientLight( 0xffffff, 0.35 );
		scene.add( lightAmbient );
		
		/* LIGHTS */
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
		
		// const hemiHelper = new THREE.HemisphereLightHelper( hemi, 5 );
		// scene.add( hemiHelper );
		
		/* CAMERA */
		let camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.set( 0, 0, 0.1 );
		
		let cameraRig = new THREE.Group();
		cameraRig.add( camera );
		
		// cameraRig.position.set( 0, 0, 0 );
		cameraRig.lookAt( 0, 0, -1 );
		
		scene.add( cameraRig );
		
		// const helper = new THREE.CameraHelper( camera );
		// scene.add( helper );
		
		const seeing = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
		seeing.position.z = 2500;
		
		/* CONTROL */
		const controls = new OrbitControls( camera, renderer.domElement );
		// const controls = new OrbitControls( seeing, renderer.domElement );
		
		controls.listenToKeyEvents( window ); // optional
		
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		
		controls.screenSpacePanning = false;
		
		controls.minDistance = 0;
		controls.maxDistance = 1; 
		controls.minPolarAngle = Math.PI / 3;
		controls.maxPolarAngle = Math.PI / 1.5;
		
		
		/* LOAD ASSET */
		const loader = new GLTFLoader();
		
		// gltf.animations; // Array<THREE.AnimationClip>
		// gltf.scene; // THREE.Group
		// gltf.scenes; // Array<THREE.Group>
		// gltf.cameras; // Array<THREE.Camera>
		// gltf.asset; // Object
		
		// Load a glTF resource
		loader.load(
			// resource URL
			'../../design_src/3d/school_class_room/scene.gltf',
		
			// called when the resource is loaded
			function ( gltf ) {
		
				gltf.scene.position.set( 96.55, -1.55, -13 );
		
				scene.add( gltf.scene );
		
			},
			function (xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
			function (error) { console.error('An error happened', error); }
		);
		
		/* RENDERING */
		// window.addEventListener( 'resize', onWindowResize );
		
		// function onWindowResize() {
		// 	camera.aspect = window.innerWidth / window.innerHeight;
		// 	camera.updateProjectionMatrix();
		
		// 	renderer.setSize( window.innerWidth, window.innerHeight );
		// }
		
		function animate() {
			controls.update();
		
			render();
		}
		
		function render() {
			renderer.render( scene, camera );
			// renderer.render( scene, seeing );
		}
		
		renderer.setAnimationLoop( animate );
	}
}