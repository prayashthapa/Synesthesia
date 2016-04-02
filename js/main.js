// *****************************************************************

var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
mouseX = 0, mouseY = 0,

windowHalfX = window.innerWidth / 2,
windowHalfY = window.innerHeight / 2,

SEPARATION = 200,
AMOUNTX = 10,
AMOUNTY = 10,
camera, container, tick = 0, clock = new THREE.Clock(true), controls, scene, renderer, stats, options, spawnerOptions, particleSystem, cubeMesh;
var cubes = [];

init();
render();

// *****************************************************************
// * Initialization

function init() {
  var separation = 100, amountX = 50, amountY = 50, particles, particle;

  // * Camera
  camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
  camera.position.z = 500;
  camera.position.y = 300;
  camera.position.x = 300;

  // * Scene

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xCCCCC, 0.0015);

  // * Renderer

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(scene.fog.color);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById('container');
  container.appendChild(renderer.domElement);

  // *****************************************************************
  // Trackball Controls

  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 2.0;
  controls.zoomSpeed = 2.2;
  controls.panSpeed = 1;
  controls.dynamicDampingFactor = 0.3;

  // * Lines
  for (var i = 0; i < 300; i++) {
    var geometry = new THREE.Geometry();
    var vertex = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    vertex.normalize();
    vertex.multiplyScalar(500);
    geometry.vertices.push(vertex);

    var vertex2 = vertex.clone();
    vertex2.multiplyScalar(Math.random() * 0.3 + 1);
    geometry.vertices.push(vertex2);

    var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: Math.random() }));
    scene.add(line);
  }

  // * Icosahedron
  var geometry = new THREE.OctahedronGeometry(200, 2)
  geometry.colorsNeedUpdate = true;
  var material = new THREE.MeshPhongMaterial({
    color: '#DC5978',
    shading: THREE.FlatShading,
    vertexColors: THREE.FaceColors
  });
  var ico01 = new THREE.Mesh(geometry, material);
  scene.add(ico01);

  // Polygons

  // var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
  // var material =  new THREE.MeshPhongMaterial( { color:0xffffff, shading: THREE.FlatShading } );
  //
  // for ( var i = 0; i < 100; i ++ ) {
  //   var mesh = new THREE.Mesh( geometry, material );
  //   mesh.position.x = ( Math.random() - 0.5 ) * 1000;
  //   mesh.position.y = ( Math.random() - 0.5 ) * 1000;
  //   mesh.position.z = ( Math.random() - 0.5 ) * 1000;
  //   mesh.updateMatrix();
  //   mesh.matrixAutoUpdate = false;
  //   scene.add( mesh );
  // }

  // Cubes
  for ( var i = 0; i < 255; i++ ) {
    var cubeGeometry = new THREE.CubeGeometry(15, 15, 15);
    var cubeMaterial = new THREE.MeshPhongMaterial({
      color: randomFairColor(),
      specular: 0xffffff,
      shininess: 20,
      reflectivity: 2.5,
      shading: THREE.FlatShading
    });

    cubes[i] = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubes[i].position.x = (Math.random() - 0.5) * 1000;
    cubes[i].position.y = (Math.random() - 0.5) * 1000;
    cubes[i].position.z = (Math.random() - 0.5) * 1000;
    cubes[i].updateMatrix();
    scene.add(cubes[i]);
  }

  // *****************************************************************
  // Lights

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set( 1, 1, 1 );
  scene.add(light);

  light = new THREE.DirectionalLight(0x002288);
  light.position.set( -1, -1, -1 );
  scene.add(light);

  light = new THREE.DirectionalLight(0x002288);
  light.position.set( -1, -1, 1 );
  scene.add(light);

  light = new THREE.AmbientLight(0x222222);
  scene.add(light);

  // *****************************************************************
  // Stats

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.zIndex = 100;
  container.appendChild( stats.domElement );

  // document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener( 'mousedown', onclick, false );
}

// *****************************************************************
// Animation

function render() {
  var delta = clock.getDelta();
  controls.update(delta);
  stats.update();

  tick += delta;
  if (tick < 0) tick = 0;
  if (delta > 0) {
    if(typeof array === 'object' && array.length > 0) {
      var k = 0;
      for(var i = 0; i < cubes.length; i++) {
        var scale = (array[k] + boost) / 30;
        // cubes[i].position.x = (scale < 1 ? 1 : scale);
        cubes[i].scale.x = array[k] * 0.025 + 0.05;
        cubes[i].scale.z = array[k] * 0.025 + 0.05;
        cubes[i].scale.z = array[k] * 0.025 + 0.05;
        k += (k < array.length ? 1 : 0);
      }
    }
  }

  // camera.position.x += ( mouseX - camera.position.x ) * .05;
  // camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

// *****************************************************************
// Event Handlers

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onclick(){
  event.preventDefault();
}

function randomFairColor() {
  var min = 64;
  var max = 224;
  var r = (Math.floor(Math.random() * (max - min + 1)) + min) * 65536;
  var g = (Math.floor(Math.random() * (max - min + 1)) + min) * 256;
  var b = (Math.floor(Math.random() * (max - min + 1)) + min);
  return r + g + b;
}
