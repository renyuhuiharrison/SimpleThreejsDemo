//声明全局变量
var renderer, camera, scene, geometry, material, mesh

//性能显示插件，需要每帧调用
stats = new Stats();
document.body.appendChild(stats.dom);

//初始化渲染器
function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

//初始化场景
function initScene() {
    scene = new THREE.Scene();
}

//初始化相机
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 15);
}

//初始化模型
function initMesh() {
    geometry = new THREE.BoxGeometry(2,2,2);
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

//初始化GUI
function initGUI() {
    
    var datControls = {
        positionX: 0, 
        positionY: 0,
        positionZ: 0};
    
    gui = new dat.GUI();
    gui.add(datControls, "positionX", -10, 10).onChange(updateCubePosition);
    gui.add(datControls, "positionY", -10, 10).onChange(updateCubePosition);
    gui.add(datControls, "positionZ", -10, 10).onChange(updateCubePosition);
    
    //更新cube位置
    function updateCubePosition() {
        mesh.position.set(datControls.positionX, datControls.positionY, datControls.positionZ);
    }

    //导入Obj模型
    var importBtn = new function() {
        this.ImportObjModel = function() {
            initObjModel();
        }
    }
    gui.add(importBtn, "ImportObjModel");
}

//初始化交互器
function initControls() {
    //创建控制器对象
    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    //监听鼠标事件
    controls.addEventListener('change', ()=>{
        renderer.render(scene, camera);
    });
}

//导入obj模型
function initObjModel() {

    var objLoader = new THREE.OBJLoader();

    objLoader.load(
	'./models/angel.obj',
	// called when resource is loaded
	function ( object ) {
        object.children[0].material = material;
		scene.add( object );
	},
	// called when loading is in progresses
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	// called when loading has errors
	function ( error ) {
		console.log( 'An error happened' );
	});
}


//渲染
function render() {
    requestAnimationFrame(render) //循环调用render()

    // mesh.rotation.x += 0.01
    // mesh.rotation.y += 0.02

    stats.update();
    
    renderer.render(scene, camera);
}



function init(){

    initRenderer();
    initScene();
    initCamera();
    initMesh();
    initGUI();
    initControls();

    render();
}

//onload比ready执行得稍晚一些
window.onload = init