"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { pointer, scrollStore, rangeProgress } from "@/lib/experience-store"

type Props = {
  isDark: boolean
  reducedMotion: boolean
  quality: "low" | "high"
}

// Custom Glass Translucent Shader for the outer intelligence sphere shell
const GlassShellShader = {
  uniforms: {
    uColor: { value: new THREE.Color("#9B7CF0") },
    uRimColor: { value: new THREE.Color("#DCD0FF") },
    uOpacity: { value: 0.85 },
    uFresnelBias: { value: 0.15 },
    uFresnelScale: { value: 0.85 },
    uFresnelPower: { value: 2.4 },
    uLightPos1: { value: new THREE.Vector3(3, 4, 5) },
    uLightPos2: { value: new THREE.Vector3(-3, -2, 4) },
    uIsDark: { value: 0.0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uRimColor;
    uniform float uOpacity;
    uniform float uFresnelBias;
    uniform float uFresnelScale;
    uniform float uFresnelPower;
    uniform vec3 uLightPos1;
    uniform vec3 uLightPos2;
    uniform float uIsDark;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel calculation for physical glass curvature
      float fresnel = uFresnelBias + uFresnelScale * pow(1.0 - max(0.0, dot(viewDir, normal)), uFresnelPower);
      fresnel = clamp(fresnel, 0.0, 1.0);

      // Soft dual specular highlights (communicating 3D glass material)
      vec3 lightDir1 = normalize(uLightPos1);
      vec3 halfDir1 = normalize(lightDir1 + viewDir);
      float spec1 = pow(max(0.0, dot(normal, halfDir1)), 36.0);

      vec3 lightDir2 = normalize(uLightPos2);
      vec3 halfDir2 = normalize(lightDir2 + viewDir);
      float spec2 = pow(max(0.0, dot(normal, halfDir2)), 20.0);

      // Soft 3D diffuse dimensionality
      float NdotL = max(0.0, dot(normal, lightDir1));
      float wrapDiff = (NdotL + 0.35) / 1.35;

      vec3 base = mix(uColor * (0.85 + 0.30 * wrapDiff), uRimColor, fresnel * 0.60);
      vec3 specColor = uIsDark > 0.5 ? vec3(0.9, 0.85, 1.0) : vec3(1.0, 1.0, 1.0);
      vec3 finalColor = base + specColor * (spec1 * 0.75 + spec2 * 0.35);

      // Translucent center allows internal intelligence structure to shine through
      float alpha = mix(uOpacity * 0.65, uOpacity * 0.95, fresnel);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
}

// Generates internal neural nodes and synaptic connections inside the sphere
function useNeuralNetwork() {
  return useMemo(() => {
    const nodeCount = 20
    const rawNodes: THREE.Vector3[] = []
    
    // Distribute internal nodes within radius [0.20, 0.58]
    const seed = [
      [0.22, 0.18, 0.25], [-0.28, 0.32, -0.15], [0.15, -0.35, 0.28],
      [-0.18, -0.22, -0.32], [0.35, -0.12, -0.24], [-0.32, -0.15, 0.22],
      [0.05, 0.42, 0.18], [-0.12, 0.38, -0.26], [0.38, 0.22, -0.18],
      [-0.36, 0.12, 0.30], [0.12, -0.42, -0.18], [-0.22, -0.36, 0.18],
      [0.28, 0.08, 0.38], [-0.08, -0.18, 0.42], [0.42, -0.25, 0.12],
      [-0.25, 0.22, 0.36], [0.08, 0.25, -0.42], [-0.42, -0.08, -0.22],
      [0.18, -0.28, 0.35], [-0.15, 0.15, -0.38],
    ]

    seed.forEach(([x, y, z]) => {
      rawNodes.push(new THREE.Vector3(x, y, z))
    })

    // Create line segments for nodes that are within distance 0.46
    const linePositions: number[] = []
    for (let i = 0; i < rawNodes.length; i++) {
      for (let j = i + 1; j < rawNodes.length; j++) {
        const dist = rawNodes[i].distanceTo(rawNodes[j])
        if (dist < 0.46) {
          linePositions.push(
            rawNodes[i].x, rawNodes[i].y, rawNodes[i].z,
            rawNodes[j].x, rawNodes[j].y, rawNodes[j].z
          )
        }
      }
    }

    return {
      nodes: rawNodes,
      linePositions: new Float32Array(linePositions),
    }
  }, [])
}

export function CrystalSphere({ isDark, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null)
  const innerGroup = useRef<THREE.Group>(null)
  const shellMat = useRef<THREE.ShaderMaterial>(null)
  const coreMat = useRef<THREE.MeshBasicMaterial>(null)
  const linesMat = useRef<THREE.LineBasicMaterial>(null)
  const pointsMat = useRef<THREE.PointsMaterial>(null)

  const neural = useNeuralNetwork()

  // Localized soft halo glow with short visual falloff (contained closely around the sphere)
  const localizedGlowTexture = useMemo(() => {
    if (typeof document === "undefined") return null
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    
    const gradient = ctx.createRadialGradient(128, 128, 60, 128, 128, 128)
    gradient.addColorStop(0, "rgba(155, 124, 240, 0.48)")
    gradient.addColorStop(0.35, "rgba(155, 124, 240, 0.22)")
    gradient.addColorStop(0.70, "rgba(155, 124, 240, 0.05)")
    gradient.addColorStop(1, "rgba(155, 124, 240, 0)")
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Create point geometry for neural dots
  const pointsGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const pos = new Float32Array(neural.nodes.length * 3)
    neural.nodes.forEach((n, i) => {
      pos[i * 3] = n.x
      pos[i * 3 + 1] = n.y
      pos[i * 3 + 2] = n.z
    })
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    return geom
  }, [neural])

  // Create line segments geometry for neural network pathways
  const linesGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute("position", new THREE.BufferAttribute(neural.linePositions, 3))
    return geom
  }, [neural])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const p = scrollStore.get()

    // Smooth pointer easing
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, delta * 3)
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, delta * 3)

    // Gentle breathing & adaptation pulse
    if (group.current) {
      const adapt = rangeProgress(p, 0.62, 0.74)
      const breathe = reducedMotion ? 0 : Math.sin(t * 0.8) * 0.008
      const pulse = adapt > 0 && adapt < 1 ? Math.sin(adapt * Math.PI) * 0.035 : 0
      const target = 1 + breathe + pulse
      group.current.scale.setScalar(
        group.current.scale.x + (target - group.current.scale.x) * Math.min(1, delta * 4),
      )
    }

    // Very gentle internal neural rotation (giving living intelligence)
    if (innerGroup.current && !reducedMotion) {
      innerGroup.current.rotation.y = t * 0.06
      innerGroup.current.rotation.x = Math.sin(t * 0.04) * 0.12
    }

    // Synchronize shader uniforms with theme
    if (shellMat.current) {
      if (isDark) {
        shellMat.current.uniforms.uColor.value.set("#7A5CC8")
        shellMat.current.uniforms.uRimColor.value.set("#C5B4FA")
        shellMat.current.uniforms.uOpacity.value = 0.88
        shellMat.current.uniforms.uIsDark.value = 1.0
      } else {
        shellMat.current.uniforms.uColor.value.set("#9B7CF0")
        shellMat.current.uniforms.uRimColor.value.set("#E5DCFC")
        shellMat.current.uniforms.uOpacity.value = 0.84
        shellMat.current.uniforms.uIsDark.value = 0.0
      }
    }
  })

  // Theme-tailored colors for internal structure & core
  const coreColor = isDark ? "#A080F8" : "#B59DF8"
  const linePathwayColor = isDark ? "#B9A5F8" : "#8A69E8"
  const pointNodeColor = isDark ? "#E5DCFC" : "#724FD8"

  return (
    <group ref={group}>
      {/* 1. Localized soft halo glow behind the sphere (short visual falloff) */}
      {localizedGlowTexture && (
        <mesh position={[0, 0, -0.04]}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshBasicMaterial
            map={localizedGlowTexture}
            transparent
            opacity={isDark ? 0.32 : 0.22}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 2. Internal Intelligence Structure (Neural Pathways, Synaptic Nodes, Core Glow) */}
      <group ref={innerGroup}>
        {/* Soft luminous internal core with radial falloff */}
        <mesh>
          <sphereGeometry args={[0.34, 32, 32]} />
          <meshBasicMaterial
            ref={coreMat}
            color={coreColor}
            transparent
            opacity={isDark ? 0.58 : 0.46}
            depthWrite={false}
          />
        </mesh>

        {/* Delicate internal neural pathways (lines) */}
        <lineSegments geometry={linesGeometry}>
          <lineBasicMaterial
            ref={linesMat}
            color={linePathwayColor}
            transparent
            opacity={isDark ? 0.42 : 0.30}
            depthWrite={false}
          />
        </lineSegments>

        {/* Tiny internal intelligence node points */}
        <points geometry={pointsGeometry}>
          <pointsMaterial
            ref={pointsMat}
            color={pointNodeColor}
            size={0.024}
            transparent
            opacity={isDark ? 0.75 : 0.55}
            depthWrite={false}
          />
        </points>
      </group>

      {/* 3. Outer Translucent Glass Shell (Radius 0.80) with Fresnel rim and specular highlights */}
      <mesh>
        <sphereGeometry args={[0.80, 64, 64]} />
        <shaderMaterial
          ref={shellMat}
          vertexShader={GlassShellShader.vertexShader}
          fragmentShader={GlassShellShader.fragmentShader}
          uniforms={GlassShellShader.uniforms}
          transparent={true}
          depthWrite={true}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  )
}




