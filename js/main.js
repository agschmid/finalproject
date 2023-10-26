import * as THREE from 'three';

const scene = new THREE.Scene();

scene.background = new THREE.Color( 0xbfe3dd );


const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.SphereGeometry( 1, 32, 16 );
const material = new THREE.MeshNormalMaterial();
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

camera.position.z = 5;

let px = 0
let py = 0
let pz = 0
let vx = 0.0; // Velocity x and y
let vy = 0.0;
let updateRate = 1/60;

let divLog = document.querySelector('#log')



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
        zMult = 1
    }
    playing=true
})


function animate() {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );

    sphere.position.set(px, py, pz)
}

function getAccel(){
    DeviceMotionEvent.requestPermission().then(response => {
        if (response == 'granted') {
            // Add a listener to get smartphone orientation 
           // in the alpha-beta-gamma axes (units in degrees)
            window.addEventListener('deviceorientation',(event) => {
                // Expose each orientation angle in a more readable way



                let rotation_degrees = event.alpha;
                let frontToBack_degrees = event.beta;
                let leftToRight_degrees = event.gamma;



                // Update velocity according to how tilted the phone is
                // Since phones are narrower than they are long, double the increase to the x velocity
                vx = vx + leftToRight_degrees * updateRate*2; 
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

                pz = pz+0.1*zMult


                if (pz < -10){
                    zMult=1
                }
                if (pz > 0) {
                    zMult=-1
                }

                // divLog.innerText=pz


            });
        }
    });
}