'use client'
import {useEffect, useRef} from "react";
import * as THREE from "three";
import GUI from "lil-gui";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import vert from './Physics/vert.glsl';
import frag from './Physics/frag.glsl';

import posShader from './Physics/GPGPU/pos.glsl';
import velShader from './Physics/GPGPU/vel.glsl';
import {GPUComputationRenderer} from "three/examples/jsm/misc/GPUComputationRenderer.js";




export default function Physics(){
    const L1 = useRef<HTMLCanvasElement|null>(null);

    function ren(){
        /**
         * Base
         */

        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2)
        }

        //const gui = new GUI()
        const debugObject = {
            clearColor: '#160920'
        }
        // Canvas
        const canvas = L1.current;

        // Scene
        const scene = new THREE.Scene();

        /**
         * Renderer
         */
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas as HTMLCanvasElement | OffscreenCanvas | undefined,
            antialias: true
        })
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(sizes.pixelRatio)








        /**
         * Particles
         */
        const geo = new THREE.IcosahedronGeometry(3,15);
        console.log(geo.attributes.position.count)
        geo.setIndex(null)

        // GPGPU
        const count = geo.attributes.position.count
        const TexSize = Math.ceil(Math.sqrt(count))
        
        const gpgpu = new GPUComputationRenderer(TexSize,TexSize,renderer)
        const positionTex = gpgpu.createTexture()
        const velocityTex = gpgpu.createTexture()


        const sizeArr = new Float32Array(count)
        for (let i = 0; i < count; i++){
            const i3 = i*3;
            const i4 = i*4;

            if (positionTex.image.data && velocityTex.image.data) {
                positionTex.image.data[i4] = geo.attributes.position.array[i3]
                positionTex.image.data[i4+1] = geo.attributes.position.array[i3+1]
                positionTex.image.data[i4+2] = geo.attributes.position.array[i3+2]
                positionTex.image.data[i4+3] = Math.random() // mass

                // 0 init speed
                velocityTex.image.data[i4] = 0
                velocityTex.image.data[i4+1] = 0
                velocityTex.image.data[i4+2] = 0
                velocityTex.image.data[i4+3] = 0

                sizeArr[i] = Math.random()
            }

        }

        const posVariable = gpgpu.addVariable('uPosTexture',posShader,positionTex);
        const velVariable = gpgpu.addVariable('uVelTexture',velShader,velocityTex);

        gpgpu.setVariableDependencies(posVariable,[posVariable,velVariable])
        gpgpu.setVariableDependencies(velVariable,[posVariable,velVariable])

        posVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0.0);

        velVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0.0);
        velVariable.material.uniforms.uTexSize = new THREE.Uniform(TexSize);

        gpgpu.init()

        const uvArr = new Float32Array(count*2);

        for (let y = 0; y < TexSize; y++){
            for (let x = 0; x < TexSize; x++){
                // the size of array
                const i = (y*TexSize + x)
                const i2 = i*2

                // it will sit at lower left of each pixel if we just do x/TXsize
                // so add 0.5 to force it sit on middle of each particle
                const uvX = (x+0.5)/TexSize
                const uvY = (y+0.5)/TexSize

                uvArr[i2] = uvX;
                uvArr[i2+1] = uvY;
            }
        }


        const material =  new THREE.ShaderMaterial({
            vertexShader: vert as string,
            fragmentShader: frag as string,
            uniforms:
                {
                    uSize: new THREE.Uniform(0.3),
                    uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
                    uDataTex: new THREE.Uniform(gpgpu.getCurrentRenderTarget(posVariable).texture),
                },
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true
        })


        const bufferGeo = new THREE.BufferGeometry;

        bufferGeo.setDrawRange(0,count)
        bufferGeo.setAttribute('aUv',new THREE.BufferAttribute(uvArr,2))
        bufferGeo.setAttribute('aSize', new THREE.BufferAttribute(sizeArr,1))


        const particles = new THREE.Points(bufferGeo,material)
        scene.add(particles)

        /**
         * GPU Compute
         */





        window.addEventListener('resize', () =>
        {
            // Update sizes
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight
            sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

            // Materials
            material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

            // Update camera
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()

            // Update renderer
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(sizes.pixelRatio)
        })

        /**
         * Camera
         */
            // Base camera
        const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.001, 1000)
        camera.position.set(0, 0, 18)
        scene.add(camera)


        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

        


        /**
         * Animate
         */
        const clock = new THREE.Clock()
        let prevTime = 0

        const tick = () =>
        {
            const elapsedTime = clock.getElapsedTime()
            const delta =  Math.min(elapsedTime - prevTime,1/60)
            prevTime = elapsedTime

            controls.update()

            velVariable.material.uniforms.uDeltaTime.value = delta
            posVariable.material.uniforms.uDeltaTime.value = delta
            gpgpu.compute()
            particles.material.uniforms.uDataTex.value =
                gpgpu.getCurrentRenderTarget(posVariable).texture

            // Render
            renderer.render(scene, camera)

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }

        tick()

    }
    useEffect(ren);


    return (<canvas ref={L1}></canvas>);
}