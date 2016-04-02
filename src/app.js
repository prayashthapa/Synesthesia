// ********************************************************************************
// - app.js

var SCREEN_WIDTH          = window.innerWidth;
var SCREEN_HEIGHT         = window.innerHeight;
var windowHalfX           = SCREEN_WIDTH / 2;
var windowHalfY           = SCREEN_HEIGHT / 2;

var camera, container, tick = 0, clock = new THREE.Clock(true), controls, scene, renderer, stats;

var cubes = [];
var icosahedron, icosFrame;

var palette = ["#ECF0F1", "#7877f9", "#3498DB", "#ffa446"];

var scaleArray = [60, 62, 64, 65, 67, 69, 71, 72];
var note = 0;

var osc = new p5.SinOsc();
var envelope = new p5.Env();
var fft = new p5.FFT();
var amplitude = new p5.Amplitude();
var reverb = new p5.Reverb();
var spectrum, waveform;

// ********************************************************************************

function init() {
  // ******************************************************************************
  // - Initialization

  envelope.setADSR(0.1, 0.5, 0.1, 0.5);
  envelope.setRange(1, 0);

  reverb.process(osc, 3, 2);
  osc.amp(envelope);
  osc.start();

  // for (var i = 0; i < scaleArray.length; i++) {
  //   var midiValue = scaleArray[1];
  //   var freqValue = midiToFreq(midiValue);
  //   osc.freq(freqValue);
  //
  //   envelope.play(osc, 0, 0.1);
  //   // note = (note + 1) % scaleArray.length;
  // }

  // * Camera
  camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 5000);
  camera.position.z = 800;
  camera.position.y = windowHalfY;
  camera.position.x = windowHalfX;

  // * Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x7aa8ff, 0.0011); // 0xCCCCC

  // * Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(scene.fog.color);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById('container');
  container.appendChild(renderer.domElement);

  // ******************************************************************************
  // - Trackball Controls

  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 2.0;
  controls.zoomSpeed = 1;
  controls.panSpeed = 1;
  controls.dampingFactor = 0.3;
  controls.minDistance = 600;
  controls.maxDistance = 1000;

  // ******************************************************************************
  // - Visuals

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

    var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: Math.random(3),
      transparent: true,
      fog: true,
      opacity: 0.25
    }));
    scene.add(line);
  }

  // * Icosahedron
  var icosGeometry = new THREE.OctahedronGeometry(350, 2);
  var icosFrameGeom = new THREE.OctahedronGeometry(400, 2);
  // icosGeometry.colorsNeedUpdate = true;
  var icosMaterial = new THREE.MeshPhongMaterial({
    color: '#d92b6a',
    shading: THREE.FlatShading,
    vertexColors: THREE.FaceColors
  });

  var icosWire = new THREE.MeshPhongMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.2, wireframe: true });

  icosahedron = new THREE.Mesh(icosGeometry, icosMaterial);
  icosFrame = new THREE.Mesh(icosFrameGeom, icosWire);
  scene.add(icosahedron); scene.add(icosFrame);

  // * Polygons

  var polyGeometry = new THREE.CylinderGeometry(0, 10, 20, 4, 1);
  var polyMaterial =  new THREE.MeshPhongMaterial({
    color:0xffffff,
    shading: THREE.FlatShading
  });

  for ( var i = 0; i < 100; i ++ ) {
    var mesh = new THREE.Mesh( polyGeometry, polyMaterial );
    mesh.position.x = ( Math.random() - 0.5 ) * 1000;
    mesh.position.y = ( Math.random() - 0.5 ) * 1000;
    mesh.position.z = ( Math.random() - 0.5 ) * 1000;
    mesh.updateMatrix();
    // mesh.matrixAutoUpdate = false;
    // scene.add(mesh);
  }

  // * Cubes
  for ( var i = 0; i < 255; i++ ) {
    var cubeGeometry = new THREE.CubeGeometry(15, 15, 15);
    var cubeMaterial = new THREE.MeshPhongMaterial({
      color: palette[Math.floor(Math.random() * palette.length)],
      specular: 0xffffff,
      shininess: 20,
      reflectivity: 1.5,
      shading: THREE.FlatShading,
      // wireframe: Math.random(1) > 0.8 ? true : false
    });

    cubes[i] = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubes[i].position.x = (Math.random() - 0.5) * 1000;
    cubes[i].position.y = (Math.random() - 0.5) * 1000;
    cubes[i].position.z = (Math.random() - 0.5) * 1000;
    cubes[i].updateMatrix();
    scene.add(cubes[i]);
  }

  // ******************************************************************************
  // - Lights

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set( 1, 1, 1 );
  scene.add(light);

  light = new THREE.DirectionalLight(0x002288);
  light.position.set( -5, -1, -10 );
  scene.add(light);

  light = new THREE.AmbientLight(0x222222);
  scene.add(light);

  var pointLight = new THREE.PointLight( "#ffffff", 1.2, 200 );
  pointLight.position.set( 100, 100, 100 );
  scene.add( pointLight );

  // ******************************************************************************
  // - Stats

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.zIndex = 100;
  // container.appendChild( stats.domElement );
}

// ******************************************************************************
// - Animation

function render() {
  // * Analysis Parameters
  spectrum = fft.analyze();
  waveform = fft.waveform();
  volume = 0.005 + amplitude.getLevel() * 10;
  console.log(volume);

  var delta = clock.getDelta();
  controls.update(delta);
  stats.update();

  tick += delta;
  if (tick < 0) tick = 0;
  if (delta > 0) {
    for(var i = 0; i < cubes.length; i++) {
      cubes[i].scale.x = 1 + volume * 0.25;
      cubes[i].scale.y = 1 + volume * 0.5;
      cubes[i].scale.z = 1 + volume * 0.75;

      icosahedron.scale.x = 1 + volume * 0.05;
      icosahedron.scale.y = 1 + volume * 0.05;
      icosahedron.scale.z = 1 + volume * 0.05;
      icosahedron.rotation.x += 0.00001 + (volume * 0.00000025);

      icosFrame.scale.x = 1 + volume * 0.05;
      icosFrame.scale.y = 1 + volume * 0.05;
      icosFrame.scale.z = 1 + volume * 0.05;
      icosFrame.rotation.x += 0.00001 + (volume * 0.00000025);
    }
  }


  camera.position.x += 0.75;
  camera.position.y += 0.75;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);

  // * ¡Loop!
  requestAnimationFrame(render);

  document.addEventListener('touchstart', onTouchStart);
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousedown', onclick);
  document.addEventListener( 'mouseup', onMouseUp);
}

// ******************************************************************************
// - Events

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onclick() {
  // event.preventDefault();
  // source.stop();
}

function onMouseUp(event) {
  envelope.play(osc, 0, 0.1);
}

function onTouchStart(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    envelope.play(osc, 0, 0.1);
  }
}

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// ******************************************************************************
// - Init

init();
render();
