//声明全局变量
var renderer, camera, scene, geometry, material, mesh, bAnimate, controls

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
    
    //坐标位置UI
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

    //场景居中显示UI
    var reset = new function() {
        this.resetCamera = function() {
            resetCamera();
        }
    }
    gui.add(reset, "resetCamera");

    //播放旋转动画按钮
    bAnimate = false;
    var animateBtn = new function() {
        this.RotateAnimation = function() {
            bAnimate = !bAnimate;
        }
    }
    gui.add(animateBtn, "RotateAnimation");

    //导入Obj模型
    var importBtn = new function() {
        this.ImportObjModel = function() {
            loadObjModel();
        }
    }
    gui.add(importBtn, "ImportObjModel");

    //环境贴图
    var createSkyBoxBtn = new function() {
        this.CreateSkyBox = function() {
            loadSkyBox();
        }
    }
    gui.add(createSkyBoxBtn, "CreateSkyBox");

    //HDR环境贴图
    var createHDRSkyBtn = new function() {
        this.CreateHDRSky = function() {
            loadHDRSky();
        }
    }
    gui.add(createHDRSkyBtn, "CreateHDRSky");

}

//初始化交互器
function initControls() {
    //创建控制器对象
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    //监听鼠标事件
    controls.addEventListener('change', ()=>{
        renderer.render(scene, camera);
    });

    //改变窗口大小时，渲染同时更新
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

//清空场景
function clearScene() {
    clearObjects();
    clearBackground();
}

//清空场景中的物体
function clearObjects() {
    scene.remove(mesh);
}

//清除场景背景
function clearBackground(){
    scene.background = null;
    scene.environment = null;
}

//导入obj模型
function loadObjModel() {
    clearScene();

    var objLoader = new THREE.OBJLoader();

    objLoader.load(
	'./models/angel.obj',
	// called when resource is loaded
	function ( object ) {
        object.children[0].material = material;

        //场景中只保留一个模型
        scene.add(object);
        mesh = object;
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

//天空盒
function loadSkyBox() {
    clearScene();

    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const envMapTexture = cubeTextureLoader.load([
        "images/textures/CubeTextures01/+x.jpg",
        "images/textures/CubeTextures01/-x.jpg",
        "images/textures/CubeTextures01/+y.jpg",
        "images/textures/CubeTextures01/-y.jpg",
        "images/textures/CubeTextures01/+z.jpg",
        "images/textures/CubeTextures01/-z.jpg"
    ]);

    const sphereGeometry = new THREE.SphereBufferGeometry(1,20,20);
    const material = new THREE.MeshStandardMaterial(
        {
            metalness: 0.7,
            roughness: 0.1
        }
    )
    const sphere = new THREE.Mesh(sphereGeometry, material);
    scene.add(sphere);
    mesh = sphere;

    //给场景添加背景
    scene.background = envMapTexture;

    //给场景所有物体天机默认的环境贴图
    scene.environment = envMapTexture;
}

//HDR环境贴图
function loadHDRSky() {
    clearScene();

    const sphereGeometry = new THREE.SphereBufferGeometry(1,20,20);
    const material = new THREE.MeshStandardMaterial(
        {
            metalness: 0.7,
            roughness: 0.1
        }
    )
    const sphere = new THREE.Mesh(sphereGeometry, material);
    scene.add(sphere);
    mesh = sphere;

    const rgbeLoader = new THREE.RGBELoader();
    //异步加载
    rgbeLoader.loadAsync("images/textures/hdr01/vignaioli_night_4k.hdr").then((texture) => {
        texture.mapping = THREE.EquirectangularRefractionMapping;
        scene.background = texture;
        scene.environment = texture;
    });
}

//渲染
function render() {
    requestAnimationFrame(render) //循环调用render()

    if (bAnimate) {
        // mesh.rotation.x += 0.01
        mesh.rotation.y += 0.01
    }
    
    stats.update();
    
    renderer.render(scene, camera);
}

//居中显示模型
function resetCamera() {
    // controls.object.position.set(1, 1, 1); // 设置相机的位置
    // controls.target.set(0, 0, 0); // 设置相机所看的目标位置

    let box = new THREE.Box3().setFromObject(mesh); // 获取模型的包围盒
    let mdlen = box.max.x - box.min.x; // 模型长度
    let mdwid = box.max.z - box.min.z; // 模型宽度
    let mdhei = box.max.y - box.min.y; // 模型高度
    let x1 = box.min.x + mdlen / 2; // 模型中心点坐标X
    let y1 = box.min.y + mdhei / 2; // 模型中心点坐标Y
    let z1 = box.min.z + mdwid / 2; // 模型中心点坐标Z
    let diagonal = Math.sqrt(Math.pow(Math.sqrt(Math.pow(mdlen, 2) + Math.pow(mdwid, 2)), 2) + Math.pow(mdhei, 2)); // 获取模型整体对角线长度,这里获取模型模型对角线的目的是为了保证模型可以完全的展示在视线范围内
    // 假设我们需要的进入视角为45度
    controls.object.position.set(box.max.x + diagonal / 2, (diagonal * 2) / Math.tan(Math.PI / 180 * 45) + Math.abs(box.max.y), box.max.z + diagonal / 2); // 设置相机位置，向上偏移，确定可以包裹整个模型
    controls.target.set(x1, y1, z1); // 设置相机的视角方向，看向模型的中心点
    controls.update(); // 更新相机
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