//声明全局变量
var renderer, camera, scene, geometry, material, mesh

//初始化渲染器
function initRenderer() {
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
}

//初始化场景
function initScene() {
    scene = new THREE.Scene()
}

//初始化相机
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 200)
    camera.position.set(0, 0, 15)
}

//初始化模型
function initMesh() {
    geometry = new THREE.BoxGeometry(2,2,2)
    material = new THREE.MeshNormalMaterial()

    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
}

//运行动画
function animate() {
    requestAnimationFrame(animate) //循环调用此函数

    mesh.rotation.x += 0.01
    mesh.rotation.y += 0.02

    renderer.render(scene, camera)
}

function init(){

    initRenderer()
    initScene()
    initCamera()
    initMesh()
    animate()
}

//onload比ready执行得稍晚一些
window.onload = init