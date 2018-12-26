function createGeometry(vertices) {
    var steps = 10;
    var sides = 10;
    
    for(var i = 0; i <= steps; i++) {
        var t = i / steps;
        var r = 1;
        var angle = -Math.PI / 2.0 + Math.PI / 4.0;
        var dA = Math.PI / 2;
    
        for(var s = 0; s < sides; s++) {
        var angle = s / sides * Math.PI * 2.0 - t * Math.PI / 2.0;
            vertices.push(
                Math.cos(angle) * r,
                Math.sin(angle) * r,
                -t + 0.5
            );
        }
    }
    
    var vertexCount = (steps + 1) * sides;
    var indices = [];
    
    for(var i = 0; i < vertexCount - sides; i++) {
        if((i+1) % sides == 0) {
            indices.push(i, i+sides, i+1);
            indices.push(i, i+1, i-sides+1);
        } else {
            indices.push(i, i+sides, i+sides+1);
            indices.push(i, i+sides+1, i+1);
        }
    }
    
    // caps
    for(var i = 1; i < sides - 1; i++) {
        indices.push(0, i, i+1); // front
    
        var lssvi = vertexCount - sides;
        indices.push(lssvi, lssvi + i+1, lssvi + i); // back
    }

    var geometry = new THREE.BufferGeometry();
    
    geometry.setIndex(indices);
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    return geometry;
}


// scene and stuff
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 4;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// lights
var light = new THREE.AmbientLight(0xf000f0, 0.2)
scene.add(light);

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
scene.add(directionalLight);
directionalLight.position.set(-1, 1, 1);

var directionalLight2 = new THREE.DirectionalLight(0xff0000, 0.2)
scene.add(directionalLight2);
directionalLight2.position.set(1, -1, -1);




// add custom mesh to scene
var customGeometry = createGeometry([]);
var material = new THREE.MeshPhongMaterial();
var customMesh = new THREE.Mesh(customGeometry, material);
scene.add(customMesh);


// render loop
(function animate(time) {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
})(0);




// mouse interaction
var isMouseDown = false;
var prevMouseX = 0;
var prevMouseY = 0;

window.addEventListener('mousedown', function(event) {
    isMouseDown = true;
    prevMouseX = event.clientX;
    prevMouseY = event.clientY;
});

window.addEventListener('mouseup', function(event) {
    isMouseDown = false;
});

window.addEventListener('mousemove', function(event) {
    if(isMouseDown) {
        var dX = event.clientX - prevMouseX;
        var dY = event.clientY - prevMouseY;

        customMesh.rotation.x += dY / 200.0;
        customMesh.rotation.y += dX / 200.0;

        prevMouseX += dX;
        prevMouseY += dY;
    }
});
