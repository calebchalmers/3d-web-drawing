var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 40, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var v = [];

var steps = 10;
var sides = 10;

for(var i = 0; i <= steps; i++) {
    var t = i / steps;
    var r = 1;
    var angle = -Math.PI / 2.0 + Math.PI / 4.0;
    var dA = Math.PI / 2;

    for(var s = 0; s < sides; s++) {
        var angle = s / sides * Math.PI * 2.0 - t * Math.PI / 4.0;
        v.push(new THREE.Vector3(
            Math.cos(angle) * r,
            Math.sin(angle) * r,
            -t + 0.5
        ));
    }
}

var positions = [];
var normals = [];
var vertexCount = (steps + 1) * sides;

function calculateStuff(i1, i2, i3) {
    // positions
    var v1 = v[i1];
    var v2 = v[i2];
    var v3 = v[i3];

    positions.push(
        v1.x, v1.y, v1.z, 
        v2.x, v2.y, v2.z, 
        v3.x, v3.y, v3.z
    );

    // normals
    var a = v3.clone().sub(v1);
    var b = v2.clone().sub(v1);
    var n = a.cross(b).normalize();
    
    normals.push(
        n.x, n.y, n.z, 
        n.x, n.y, n.z, 
        n.x, n.y, n.z
    );
}

for(var i = 0; i < vertexCount - sides; i++) {
    if((i+1) % sides == 0) {
        calculateStuff(i, i+sides, i+1);
        calculateStuff(i, i+1, i-sides+1);
    } else {
        calculateStuff(i, i+sides, i+sides+1);
        calculateStuff(i, i+sides+1, i+1);
    }
}

// caps
for(var i = 1; i < sides - 1; i++) {
    calculateStuff(0, i, i+1); // front

    var lssvi = vertexCount - sides;
    calculateStuff(lssvi, lssvi + i+1, lssvi + i); // back
}


var geometry = new THREE.BufferGeometry();

//geometry.setIndex( indices );
geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

geometry.computeVertexNormals();

var material = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 4;

var animate = function (time) {
    requestAnimationFrame( animate );
    
    //cube.rotation.x = Math.sin(parseFloat(time.toString()) / 10000.0) * Math.PI;
    cube.rotation.y += 0.005;

    renderer.render( scene, camera );
};

animate();