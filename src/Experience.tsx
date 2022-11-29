import { Suspense } from 'react'

import { Canvas } from '@react-three/fiber'

import { Leva } from 'leva'

import Scene from './objets/Scene'

export default function Experience() {
  return (
    <>
      <Leva hidden={false} />
      <Canvas
        flat={false}
        shadows={true}
        dpr={1}
        camera={{
          position: [5, 5, 5],
        }}
      >
        <color args={['lightblue']} attach='background' />
        <Suspense>
          <Scene />
        </Suspense>
      </Canvas>
    </>
  )
}
