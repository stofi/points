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
        dpr={2}
        camera={{
          position: [1, 1, 1],
        }}
        gl={{
          antialias: false,
        }}
      >
        <Suspense>
          <Scene />
        </Suspense>
      </Canvas>
    </>
  )
}
