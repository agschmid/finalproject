import * as THREE from 'three';

const scene = new THREE.Scene();

scene.background = new THREE.Color( 0xbfe3dd );


const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 5000 );

var canvas = document.querySelector("#mainCanvas");

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;

document.body.appendChild( renderer.domElement );


let sphereRadius = 0.5

const geometry = new THREE.SphereGeometry(sphereRadius, 32, 16 );
const material = new THREE.MeshStandardMaterial({color:0xffffff});
const sphere = new THREE.Mesh( geometry, material );

sphere.castShadow = true;
sphere.receiveShadow = true;


scene.add( sphere );


let paddleWidth = 2
let paddleHeight = 1.5

const paddleGeom = new THREE.PlaneGeometry( paddleWidth, paddleHeight );
const paddleMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0.3} );
const paddle = new THREE.Mesh( paddleGeom, paddleMaterial );
scene.add( paddle );


let light = new THREE.DirectionalLight(0xFFFFFF, 2.0);
light.position.set(-2,-0.5,-10);
light.target.position.set(1, 2, -10);
light.castShadow = true;
scene.add(light);

let light2 = new THREE.DirectionalLight(0xFFFFFF, 3.0);
light2.position.set(0.1,0.2,0.9);
light2.target.position.set(-0.5, -0.5, -10);
light2.castShadow = true;
scene.add(light2);


const boxgeometry = new THREE.BoxGeometry( 5, 5, 12 ); 
const boxmaterial = new THREE.MeshStandardMaterial( {color: 0x222222, side: THREE.BackSide} ); 
const box = new THREE.Mesh( boxgeometry, boxmaterial ); 
box.position.z=-4
box.castShadow = false;
box.receiveShadow = true;

scene.add( box );

camera.position.z = 5;

let px = 0
let py = 0
let pz = 0
let vx = 0.0; // Velocity x and y
let vy = 0.0;
let updateRate = 1/60;

let divLog = document.querySelector('#log')

let sx = 0
let sy = 0
let sz = -0.5
let svx = 0.0; // Velocity x and y
let svy = 0.0;
let svz = 1.0;

animate();

window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

};

let accelPermissionElement = document.querySelector('#accelPermsButton')
accelPermissionElement.addEventListener('click', getAccel)

let shootButton = document.querySelector('#shoot')

let playing = false
let zMult = 0

shootButton.addEventListener('click', ()=>{
    if (!playing){
        zMult = -1
    }
    playing=true
})


function animate() {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );

    paddle.position.set(px, py, pz)
    sphere.position.set(sx, sy, sz)

}

let control = 'mouse'


function getAccel(){
    DeviceMotionEvent.requestPermission().then(response => {
        control="accel"
        if (response == 'granted') {
            // Add a listener to get smartphone orientation 
           // in the alpha-beta-gamma axes (units in degrees)
            window.addEventListener('deviceorientation',(event) => {
                // Expose each orientation angle in a more readable way
                let rotation_degrees = event.alpha;
                let frontToBack_degrees = event.beta;
                let leftToRight_degrees = event.gamma;

                // Update velocity according to how tilted the phone is
                vx = vx + leftToRight_degrees * updateRate; 
                vy = vy + frontToBack_degrees * updateRate;

                // Update position and clip it to bounds
                px = px + vx*.01;
                if (px > 2 || px < -2){ 
                    px = Math.max(-2, Math.min(2, px)) // Clip px between 0-98
                    vx = 0;
                }

                py = py - vy*.01;
                if (py > 2 || py < -2){
                    py = Math.max(-2, Math.min(2, py)) // Clip py between 0-98
                    vy = 0;
                }
                
            });
        }
    });
}

let mouseX = 0
let mouseY = 0
let mouseXChange = 0
let mouseYChange = 0

document.addEventListener("mousemove", (event) => {
    mouseXChange = event.screenX-mouseX;
    mouseYChange = event.screenY-mouseY;
    mouseX = event.screenX
    mouseY = event.screenY
})

// https://woodenraft.games/blog/how-to-implement-consistent-frame-rate-threejs

function gameLoop() {
    if (control=="mouse"){
        // Update position and clip it to bounds
        px = px + mouseXChange*.005;
        if (px > 2 || px < -2){ 
            px = Math.max(-2, Math.min(2, px)) // Clip px between 0-98
            mouseXChange=0
        }

        py = py - mouseYChange*.005;
        if (py > 2 || py < -2){
            py = Math.max(-2, Math.min(2, py)) // Clip py between 0-98
            mouseYChange = 0
        }
    }
    
    sx = sx - svx*0.1;
    if (sx > 2 || sx < -2){ 
        sx = Math.max(-2, Math.min(2, sx)) // Clip px between 0-98
        svx = -svx;
    }

    sy = sy - svy*0.1;
    if (sy > 2 || sy < -2){
        sy = Math.max(-2, Math.min(2, sy)) // Clip py between 0-98
        svy = -svy;
    }

    sz = sz+0.1*svz*zMult

                if (playing){
                    if (sz < -10){
                        zMult=1
                    }
    
                    if (sz > -0.5) {
    
                        let a=Math.abs(px-sx)
                        let b=Math.abs(py-sy)
                        if (didPaddleHit(a-0.5*paddleWidth,b-0.5*paddleHeight)){

                            zMult=-1
                            let alpha = a*2/paddleWidth
                            let beta = b*2/paddleHeight

                            let vScale = (1 / (alpha**2 + beta**2 + 1))**0.5

                            svx = Math.sign(px-sx)*vScale*alpha
                            svy = Math.sign(py-sy)*vScale*beta
                            svz = vScale

                        } else {
                            zMult=0
                            svx = 0
                            svy = 0
                            svz=1
                            playing = false
                        }
                            
                    }
    
                }
}

const fpsCap = createFpsCap( gameLoop, 60 );

function onAnimationFrame( time ) {
    fpsCap.loop( time );
    requestAnimationFrame( onAnimationFrame );
}

requestAnimationFrame( onAnimationFrame );


function createFpsCap(loop, fps = 60) {
    let targetFps = 0, fpsInterval = 0;
    let lastTime = 0, lastOverTime = 0, prevOverTime = 0, deltaTime = 0;
  
    function updateFps(value) {
      targetFps = value;
      fpsInterval = 1000 / targetFps;
    }
  
    updateFps(fps);
  
    return {
      // the targeted frame rate
      get fps() {
        return targetFps;
      },
      set fps(value) {
        updateFps(value);
      },
  
      // the frame-capped loop function
      loop: function(time) {
        deltaTime = time - lastTime;
  
        if(deltaTime < fpsInterval) {
          return;
        }
  
        prevOverTime = lastOverTime;
        lastOverTime = deltaTime % fpsInterval;
        lastTime = time - lastOverTime;
  
        deltaTime -= prevOverTime;
  
        return loop(deltaTime);
      },
    };
  }

// https://stackoverflow.com/questions/47639413/algorithm-for-accurate-detection-of-overlap-between-a-square-and-a-circle
function didPaddleHit(a, b){
    if (a>0) {
        if (b>0) {
            return a**2 + b**2<sphereRadius**2;
        } else {
            return a<sphereRadius;
        }
    } else {
        return b<sphereRadius;
    }
}