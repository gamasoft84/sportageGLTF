LOADER = document.getElementById('js-loader');

const TRAY = document.getElementById('js-tray-slide');
const DRAG_NOTICE = document.getElementById('js-drag-notice');

var modelCar;

const MODEL_PATH = "sportage.glb";

var activeOption = 'object001';

var loaded = false;

const colors = [
  {
    color: '212121',
    name: 'Cherry Black'
  },

  {
    color: '282a2a',
    name: 'Mercury Blue'
  },

  {
    color: '5e5f63',
    name: 'Sparkling Silver'
  },

  {
    color: 'ba1c1c',
    name: 'Fiery Red 792224'
  },

  {
    color: '7b7c7c',
    name: 'Iron Grey'
  },

  {
    color: 'ffffff',
    name: 'Snow White Pearl a5a5a4'
  },
  {
    color: 'fc9736'
  }
];




const BACKGROUND_COLOR = 0xffffff;
// Init the scene
const scene = new THREE.Scene();
// Set background
scene.background = new THREE.Color(BACKGROUND_COLOR);
scene.fog = new THREE.Fog(BACKGROUND_COLOR, 1, 4000);

const canvas = document.querySelector('#c');

// Init the renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.toneMappingExposure = 0.99;
document.body.appendChild(renderer.domElement);

// Add a camerra
var cameraFar = 600;
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set( -600, -100, 400 );


// Initial material
const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 30 });
const INITIAL_CALIPER_MTL = new THREE.MeshPhongMaterial({ color: 0xba1c1c, shininess: 30 });

const INITIAL_MAP = [
  { childID: "object001", mtl: INITIAL_MTL },//body
  { childID: "wheel001_rim_0", mtl: INITIAL_MTL },//whell
  { childID: "wheel002_rim_0", mtl: INITIAL_MTL },
  { childID: "wheel005_rim_0", mtl: INITIAL_MTL },
  { childID: "wheel007_rim_0", mtl: INITIAL_MTL },
  { childID: "wheel000", mtl: INITIAL_CALIPER_MTL },//Caliper
  { childID: "wheel003", mtl: INITIAL_CALIPER_MTL },
  { childID: "wheel004", mtl: INITIAL_CALIPER_MTL },
  { childID: "wheel006", mtl: INITIAL_CALIPER_MTL }
];


// Init the object loader
var loader = new THREE.GLTFLoader();

loader.load(MODEL_PATH, function (gltf) {
  modelCar = gltf.scene;

  modelCar.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  // Set the models initial scale   
  modelCar.scale.set(2, 2, 2);
  modelCar.rotation.y = Math.PI;

  // Offset the y position a bit
  modelCar.position.y = -1;

  // Set initial textures
  for (let object of INITIAL_MAP) {
    initColor(modelCar, object.childID, object.mtl);
  }

  // Add the model to the scene
  scene.add(modelCar);

  // Remove the loader
  LOADER.remove();

}, undefined, function (error) {
  console.error(error);
});

// Function - Add the textures to the models
function initColor(parent, type, mtl) {
  parent.traverse(o => {
    if (o.isMesh) {
      if (o.name.includes(type)) {
        console.log('                       <<<<' + o.name + '>>>>' )
        //console.log(o)
       // o.material = mtl;
        o.nameID = type; // Set a new property to identify this object
      }else{
        //console.log('<' + o.name + '>' )
      }
    }
  });
}

// Add lights
var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(10, 10, 0);
// Add hemisphere light to scene   
scene.add(hemiLight);

var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(10, 0, 0);
dirLight.castShadow = false;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
// Add directional Light to scene    
scene.add(dirLight);


var dirLight2 = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight2.position.set(-10, 10, 10);
dirLight2.castShadow = false;
dirLight2.shadow.mapSize = new THREE.Vector2(1024, 1024);
// Add directional Light to scene    
scene.add(dirLight);


// Add controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 3;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
controls.autoRotateSpeed = 0.2; // 30

function animate() {

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  if (modelCar != null && loaded == false) {
    initialRotation();
    DRAG_NOTICE.classList.add('start');
  }
}

animate();

// Function - New resizing method
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var canvasPixelWidth = canvas.width / window.devicePixelRatio;
  var canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {

    renderer.setSize(width, height, false);
  }
  return needResize;
}

// Function - Build Colors

function buildColors(colors) {
  for (let [i, color] of colors.entries()) {
    let swatch = document.createElement('div');
    swatch.classList.add('tray__swatch');

    if (color.texture) {
      swatch.style.backgroundImage = "url(" + color.texture + ")";
    } else {
      swatch.style.background = "#" + color.color;
    }

    swatch.setAttribute('data-key', i);
    TRAY.append(swatch);
  }
}

buildColors(colors);

// Select Option
const options = document.querySelectorAll(".option");

for (const option of options) {
  option.addEventListener('click', selectOption);
}

function selectOption(e) {
  let option = e.target;
  activeOption = e.target.dataset.option;
  for (const otherOption of options) {
    otherOption.classList.remove('--is-active');
  }
  console.info('activeOption: ' + activeOption)
  option.classList.add('--is-active');
}

// Swatches
const swatches = document.querySelectorAll(".tray__swatch");

for (const swatch of swatches) {
  swatch.addEventListener('click', selectSwatch);
}

function selectSwatch(e) {
  let color = colors[parseInt(e.target.dataset.key)];
  let new_mtl;

  if (color.texture) {

    let txt = new THREE.TextureLoader().load(color.texture);

    txt.repeat.set(color.size[0], color.size[1], color.size[2]);
    txt.wrapS = THREE.RepeatWrapping;
    txt.wrapT = THREE.RepeatWrapping;

    new_mtl = new THREE.MeshPhongMaterial({
      map: txt,
      shininess: color.shininess ? color.shininess : 10
    });

  } else {
    new_mtl = new THREE.MeshPhongMaterial({
      color: parseInt('0x' + color.color),
      shininess: color.shininess ? color.shininess : 10
    });


  }

  console.log('activeOption: ' + activeOption + ' ' + color.color)
  setMaterial(modelCar, activeOption, new_mtl);
}

function setMaterial(parent, type, mtl) {
  console.log('-----------------------------begin-----------------------------')

  parent.traverse(o => {

    /*if(o.nameID != null){
    console.log('   <<< o.isMesh: ' + o.isMesh)
    console.log('   <<< o.nameID: ' + o.nameID)
    console.log('   <<< type: ' + type)
    if (o.nameID == type) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Se asigna material')
    console.log('   o.isMesh: ' + o.isMesh)
    console.log('   o.nameID: ' + o.nameID)
    console.log('   type: ' + type)
    o.material = mtl;
    }else{
    console.log('<' + o.nameID  + '>,' + '<' + type + '>')
    }
  }*/


    if (o.isMesh && o.nameID != null) {
      if (o.nameID == type || 
        (type == 'rim' && o.nameID.includes('rim')) ||
        (type == 'wheel' && o.nameID.startsWith('wheel')  && !o.nameID.includes('rim'))){
        o.material = mtl;
      }
    }
  });

  console.log('-----------------------------end-----------------------------')

}

// Function - Opening rotate
let initRotate = 0;

function initialRotation() {
  initRotate++;
  if (initRotate <= 120) {
    modelCar.rotation.y += Math.PI / 60;
  } else {
    loaded = true;
  }
}

var slider = document.getElementById('js-tray'), sliderItems = document.getElementById('js-tray-slide'), difference;

function slide(wrapper, items) {
  var posX1 = 0,
    posX2 = 0,
    posInitial,
    threshold = 20,
    posFinal,
    slides = items.getElementsByClassName('tray__swatch');

  // Mouse events
  items.onmousedown = dragStart;

  // Touch events
  items.addEventListener('touchstart', dragStart);
  items.addEventListener('touchend', dragEnd);
  items.addEventListener('touchmove', dragAction);


  function dragStart(e) {
    e = e || window.event;
    posInitial = items.offsetLeft;
    difference = sliderItems.offsetWidth - slider.offsetWidth;
    difference = difference * -1;

    if (e.type == 'touchstart') {
      posX1 = e.touches[0].clientX;
    } else {
      posX1 = e.clientX;
      document.onmouseup = dragEnd;
      document.onmousemove = dragAction;
    }
  }

  function dragAction(e) {
    e = e || window.event;

    if (e.type == 'touchmove') {
      posX2 = posX1 - e.touches[0].clientX;
      posX1 = e.touches[0].clientX;
    } else {
      posX2 = posX1 - e.clientX;
      posX1 = e.clientX;
    }

    if (items.offsetLeft - posX2 <= 0 && items.offsetLeft - posX2 >= difference) {
      items.style.left = items.offsetLeft - posX2 + "px";
    }
  }

  function dragEnd(e) {
    posFinal = items.offsetLeft;
    if (posFinal - posInitial < -threshold) {

    } else if (posFinal - posInitial > threshold) {

    } else {
      items.style.left = posInitial + "px";
    }

    document.onmouseup = null;
    document.onmousemove = null;
  }

}

slide(slider, sliderItems);