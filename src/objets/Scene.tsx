import * as THREE from 'three'

import { Environment, OrbitControls } from '@react-three/drei'
import {
  Bloom,
  EffectComposer,
  Glitch,
  Scanline,
} from '@react-three/postprocessing'

import { useControls } from 'leva'

import Sphere from './Sphere'

export default function Scene() {
  useControls({})

  return (
    <>
      <EffectComposer>
        <Glitch
          delay={new THREE.Vector2(10, 20)}
          strength={new THREE.Vector2(0.1, 0.2)}
          duration={new THREE.Vector2(0.01, 0.2)}
          columns={0.7}
          chromaticAberrationOffset={new THREE.Vector2(0.1, 0.2)}
        />
        <Bloom luminanceThreshold={1} mipmapBlur />
        <Scanline />
      </EffectComposer>
      <OrbitControls enablePan={false} />
      <Sphere
        radius={1}
        count={10000}
        color={new THREE.Color('cyan')}
        timeOffset={0}
        frequency={1}
        amplitude={2}
      />
      <Sphere
        radius={1}
        count={10000}
        color={new THREE.Color('yellowgreen')}
        timeOffset={Math.PI / 3}
        timeScale={-1}
        frequency={1}
        amplitude={2}
      />
      <Sphere
        radius={1}
        count={10000}
        color={new THREE.Color('lime')}
        timeOffset={(2 * Math.PI) / 3}
        frequency={1}
        amplitude={2}
      />
    </>
  )
}
