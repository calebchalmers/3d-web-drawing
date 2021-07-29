function create3DGeometry(vertices, sides) {
    var positions = [];
    var indices = [];
    var lssvi = vertices.length - sides;

    for(var i = 0; i < vertices.length; i++) {
        var v = vertices[i];
        positions.push(v.x, v.y, v.z * (recordedMaxDist + 1) * 2.0);
    }
    
    for(var i = 0; i < lssvi; i++) {
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
        indices.push(lssvi, lssvi + i+1, lssvi + i); // back
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
}

function generate2DVertices(sides, radius) {
    vertices = [];

    for(var s = 0; s < sides; s++) {
        var angle = s / sides * Math.PI * 2.0;
        vertices.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
        ));
    }

    return vertices;
}

function create2DGeometry(sides, radius) {
    vertices = [];
    indices = [];

    for(var s = 0; s < sides; s++) {
        var angle = s / sides * Math.PI * 2.0;
        vertices.push(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
        );
    }

    for(var i = 1; i < sides - 1; i++) {
        indices.push(0, i, i+1);
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
}

var recordingTimer = null;
var targetFrames = 100;
var recordedFrames = 0;
var recordedVertices = [];
var startVertices = [];
var sides = 10;
var recording = false;
var recordedMaxDist = 0;
var radius = 1;

function startRecording() {
    startVertices = generate2DVertices(sides, 1);

    var startPanel = document.getElementById('start-panel');
    startPanel.style.display = 'none';

    recordVerts(0);

    recordingTimer = window.setInterval(recordFrame, 4000 / targetFrames);
    recording = true;
}

function recordFrame() {
    recordedFrames++;

    recordVerts(1.0 * recordedFrames / targetFrames);

    console.log('recordFrame');

    if(recordedFrames == targetFrames) {
        stopRecording();
    }
}

function recordVerts(depth) {
    for(var i = 0; i < startVertices.length; i++) {
        var vertex = startVertices[i];
        vertex = mesh.localToWorld(vertex.clone());
        vertex.z = 0.5 - depth;
        recordedVertices.push(vertex);
    }
}

function stopRecording() {
    console.log('stopRecording');

    window.clearInterval(recordingTimer);
    recording = false;

    scene.remove(mesh);

    // add custom mesh to scene
    var customGeometry = create3DGeometry(recordedVertices, sides);
    var customMesh = new THREE.Mesh(customGeometry, material);
    scene.add(customMesh);

    controls.enabled = true;
}


// scene and stuff
var mainCanvas = document.getElementById('mainCanvas');
var renderer = new THREE.WebGLRenderer({canvas: mainCanvas});
renderer.setSize(window.innerWidth, window.innerHeight);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 6;

// orbit controls
var controls = new THREE.OrbitControls(camera);
controls.enableKeys = false;
controls.enablePan = false;
controls.enabled = false;

// lights
var light = new THREE.AmbientLight(0xf000f0, 0.2)
scene.add(light);

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
scene.add(directionalLight);
directionalLight.position.set(-1, 1, 1);

var directionalLight2 = new THREE.DirectionalLight(0xffaaaa, 0.2)
scene.add(directionalLight2);
directionalLight2.position.set(1, -1, -1);



var square = create2DGeometry(sides, 1);
var material = new THREE.MeshPhongMaterial();
var mesh = new THREE.Mesh(square, material);
scene.add(mesh);


// render loop
function animate(time) {
    requestAnimationFrame(animate);

    radius = THREE.Math.lerp(radius, isMouseDown ? 0.5 : 1.0, 0.3);

    controls.update();
    renderer.render(scene, camera);
};
animate();

var isMouseDown = false;
var prevMouseX = 0;
var prevMouseY = 0;

window.addEventListener('mousedown', function(event) {
    if(recordedFrames == 0) {
        startRecording();
    }

    isMouseDown = true;
    prevMouseX = event.clientX;
    prevMouseY = event.clientY;

});
window.addEventListener('mouseup', function(event) {
    isMouseDown = false;
});
window.addEventListener('mousemove', function(event) {
    if(isMouseDown && recording) {
        var dX = event.clientX - prevMouseX;
        var dY = event.clientY - prevMouseY;

        mesh.position.x += dX / 100.0;
        mesh.position.y -= dY / 100.0;

        prevMouseX += dX;
        prevMouseY += dY;

        recordedMaxDist = Math.max(recordedMaxDist, Math.pow(mesh.position.x, 2.0) + Math.pow(mesh.position.y, 2.0));
    }
});

window.addEventListener('resize', function(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);