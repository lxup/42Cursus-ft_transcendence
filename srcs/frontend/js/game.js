import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(0.3, 2, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);
scene.add(cube);
camera.position.z = 5;

const screen_to_world = (x, y) => {
	const vec = new THREE.Vector3(x * 10, y * 10, 0.5);
	vec.unproject(camera);
	return vec;
};

const top_left = screen_to_world(-1.05, 0.8);

cube.position.set(top_left.x, top_left.y, 0);

const movement = {
	up: false,
	down: false,
};

document.addEventListener("keydown", (event) => {
	switch (event.code) {
		case "KeyW":
		case "ArrowUp":
			movement.up = true;
			break;
		case "KeyS":
		case "ArrowDown":
			movement.down = true;
			break;
	}
});

document.addEventListener("keyup", (event) => {
	switch (event.code) {
		case "KeyW":
		case "ArrowUp":
			movement.up = false;
			break;
		case "KeyS":
		case "ArrowDown":
			movement.down = false;
			break;
	}
});

const animate = () => {
	if (movement.up) {
		cube.translateY(0.05);
	}
	if (movement.down) {
		cube.translateY(-0.05);
	}
	renderer.render(scene, camera);
};

renderer.setAnimationLoop(animate);
