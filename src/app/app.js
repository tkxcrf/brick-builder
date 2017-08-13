import $ from 'jquery';
import Detector from './utils/detector';

import { lighting, ambientLighting } from './modules/lighting';
import { renderer, scene, camera, controls } from './modules/essentials';
import { rollOverMesh, Brick } from './modules/bricks';
import { plane, grid } from './modules/plane';


if ( ! Detector.webgl ) Detector.addGetWebGLMessage();



let objects = [];
let raycaster, mouse;
let drag = false;
let isShiftDown = false;


init();


function init() {
  const canvas = $('#canvas')[0];
  canvas.appendChild( renderer.domElement );

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  setUpScene();
  attachEvents();
  animate();
}


function setUpScene() {
  scene.add(lighting);
  scene.add(ambientLighting);

  scene.add(rollOverMesh);
  scene.add(plane);
  scene.add(grid);

  objects.push(plane);
}


function attachEvents() {
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener( 'keydown', onDocumentKeyDown, false );
  document.addEventListener( 'keyup', onDocumentKeyUp, false );

  window.addEventListener( 'resize', onWindowResize, false );
}


function onDocumentMouseMove( event ) {
  event.preventDefault();
  drag = true;
  mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
  raycaster.setFromCamera( mouse, camera );
  const intersects = raycaster.intersectObjects( objects );
  if ( intersects.length > 0 ) {
    const intersect = intersects[ 0 ];
    rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
    rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
  }
}


function onDocumentMouseDown( event ) {
  drag = false;
}


function onDocumentMouseUp(event) {
  event.preventDefault();
  if (! drag) {
    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( objects );
    if ( intersects.length > 0 ) {
      var intersect = intersects[ 0 ];
      // delete cube
      if ( isShiftDown ) {
        deleteCube(intersect);
      // create cube
      } else {
        // var randomCol = colors[Math.floor(Math.random()*colors.length)];
        const brick = Brick(intersect);
        scene.add(brick);
        objects.push( brick );
      }
    }
  }
}


function deleteCube(intersect) {
  if ( intersect.object != plane ) {
    scene.remove( intersect.object );
    objects.splice( objects.indexOf( intersect.object ), 1 );
  }
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


function onDocumentKeyDown( event ) {
  switch( event.keyCode ) {
    case 16: isShiftDown = true; break;
  }
}


function onDocumentKeyUp( event ) {
  switch ( event.keyCode ) {
    case 16: isShiftDown = false; break;
  }
}


function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}


function render() {
  renderer.render(scene, camera);
}
