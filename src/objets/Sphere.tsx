import * as THREE from 'three'
import { useMemo, useRef } from 'react'

import { useFrame } from '@react-three/fiber'

import { useControls } from 'leva'

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uTimeOffset;
uniform float uTimeScale;
uniform float uNoiseFreq;
uniform float uNoiseAmp;

attribute float alpha;
varying float vAlpha;
varying vec3 vDisp;

//	Simplex 4D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

float snoise(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
// First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

// Permutations
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
// Gradients
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}


void applyNoise(inout vec4 pos) {
  float time = (uTimeOffset + uTime) * uTimeScale;
  float noise1 = snoise(vec4(pos.xyz * uNoiseFreq, time)) * .5 + .5  ;
  float noise2 = snoise(vec4(pos.xyz * uNoiseFreq * 5.0, time)) * .5 + .5  ;
  pos.xyz += pos.xyz * noise1 * 0.1 * uNoiseAmp * cos(time);
  pos.xyz += pos.xyz * noise2 * 0.1 * uNoiseAmp /5.;
  
}


void main() {
  vAlpha = alpha;
  
  vec4 basePos = vec4(position, 1.0);
  vec4 worldPos = modelMatrix * basePos;

  applyNoise(worldPos);
  
  vec4 viewPos = viewMatrix * worldPos;
  vec4 projectedPosition = projectionMatrix * viewPos;
  vec4 finalPosition = projectedPosition;
  


  // vDisp = position + noise * 0.1;
  gl_PointSize = 1.0;
  gl_Position = finalPosition;


}
`

const fragmentShader = /* glsl */ `
uniform vec3 color;
varying float vAlpha;

void main() {
  gl_FragColor = vec4( color, vAlpha );
  gl_FragColor.rgb += .1;
  gl_FragColor.rgb *= 4.;
}
`

const getPointOnSphere = (pointIndex: number, count: number) => {
  const phi = Math.acos(-1 + (2 * pointIndex) / count)

  const theta = Math.sqrt(count * Math.PI) * phi

  return new THREE.Vector3(
    Math.cos(theta) * Math.sin(phi),
    Math.sin(theta) * Math.sin(phi),
    Math.cos(phi),
  )
}

const createSphereGeometry = (radius: number, vertexCount: number) => {
  const vertices: number[] = []

  for (let i = 0; i < vertexCount; i++) {
    const point = getPointOnSphere(i, vertexCount).multiplyScalar(radius)
    vertices.push(point.x, point.y, point.z)
  }

  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  )

  return geometry
}

interface SphereProps {
  radius?: number
  count?: number
  color?: THREE.Color
  timeOffset?: number
  timeScale?: number
  frequency?: number
  amplitude?: number
}

export default function Sphere({
  radius = 1,
  count = 1000,
  color = new THREE.Color('cyan'),
  timeOffset = 0,
  timeScale = 1,
  frequency = 1,
  amplitude = 2,
}: SphereProps) {
  const sphereGeometry = useMemo(
    () => createSphereGeometry(radius, count),
    [count, radius],
  )

  const customPointsMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color('cyan') },
          uTime: { value: 0 },
          uTimeOffset: { value: 0 },
          uTimeScale: { value: 1 },
          uNoiseFreq: { value: 1 },
          uNoiseAmp: { value: 2 },
        },
        vertexShader,
        fragmentShader,
      }),
    [],
  )

  const directions = useMemo(
    () => [
      Math.random() > 0.5 ? 1 : -1,
      Math.random() > 0.5 ? 1 : -1,
      Math.random() > 0.5 ? 1 : -1,
    ],
    [],
  )

  const pointsObject = useRef<THREE.Points>(null!)

  useFrame((rootState, delta) => {
    pointsObject.current.rotation.y += 0.1 * delta * directions[0]
    pointsObject.current.rotation.x += 0.2 * delta * directions[1]
    pointsObject.current.rotation.z += 0.3 * delta * directions[2]

    if (
      pointsObject.current &&
      pointsObject.current.material instanceof THREE.ShaderMaterial
    ) {
      pointsObject.current.material.uniforms.uTime.value += 0.1 * delta

      pointsObject.current.material.uniforms.uNoiseFreq.value = frequency

      pointsObject.current.material.uniforms.uNoiseAmp.value = amplitude

      pointsObject.current.material.uniforms.color.value = color

      pointsObject.current.material.uniforms.uTimeOffset.value = timeOffset

      pointsObject.current.material.uniforms.uTimeScale.value = timeScale
    }
  })

  return (
    <>
      <points
        scale={0.8}
        ref={pointsObject}
        geometry={sphereGeometry}
        material={customPointsMaterial}
      ></points>
    </>
  )
}
