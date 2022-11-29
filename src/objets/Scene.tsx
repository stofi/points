import { Environment, OrbitControls } from '@react-three/drei'

import { useControls } from 'leva'

export default function Scene() {
  const { sphereColor, floorColor } = useControls({
    sphereColor: { value: '#c4c4c4', label: 'Sphere Color' },
    floorColor: { value: '#5c5c5c', label: 'Floor Color' },
  })

  return (
    <>
      <OrbitControls makeDefault />

      {/* <directionalLight />

      <hemisphereLight intensity={0.5} args={['lightblue', 'lightgreen']} /> */}

      <Environment preset='sunset' background={false}></Environment>

      <mesh position-y={1}>
        <sphereGeometry args={[1]} />
        <meshStandardMaterial color={sphereColor} roughness={0} />
      </mesh>

      <mesh rotation-x={-Math.PI * 0.5} position-y={-0.001}>
        <planeGeometry args={[10, 10]} />

        <meshStandardMaterial color={floorColor} roughness={0.8} />
      </mesh>
    </>
  )
}
