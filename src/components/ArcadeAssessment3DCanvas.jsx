import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ArcadeAssessment3DCanvas({
  scenario,
  scenarioIndex,
  onZoneHit,
  isTransitioning,
  keysRef
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const ghostRef = useRef(null);
  const portalsRef = useRef([]);
  const spriteMapRef = useRef({});
  const animFrameIdRef = useRef(null);
  const onZoneHitRef = useRef(onZoneHit);
  const isTransitioningRef = useRef(isTransitioning);

  useEffect(() => {
    onZoneHitRef.current = onZoneHit;
  }, [onZoneHit]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  // Ghost physics state
  const physicsRef = useRef({
    x: 0,
    z: 0,
    vx: 0,
    vz: 0,
    speed: 0.05,
    maxSpeed: 0.34,
    friction: 0.86,
    rotationY: 0,
    targetRotationY: 0,
    targetX: null,
    targetZ: null
  });

  // Helper to create a high-contrast crisp 2D text billboard texture for 3D portal
  const createPortalBillboardTexture = (text, color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 280;
    const ctx = canvas.getContext('2d');

    // Rounded card background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(7, 10, 24, 0.94)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.shadowColor = color;
    ctx.shadowBlur = 28;

    ctx.beginPath();
    ctx.roundRect(24, 24, canvas.width - 48, canvas.height - 48, 40);
    ctx.fill();
    ctx.stroke();

    // Subtle inner glowing border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.roundRect(34, 34, canvas.width - 68, canvas.height - 68, 30);
    ctx.stroke();

    // Action choice text centered
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Measure text to adjust font size dynamically
    let fontSize = 56;
    ctx.font = `bold ${fontSize}px sans-serif`;
    while (ctx.measureText(text).width > canvas.width - 120 && fontSize > 32) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px sans-serif`;
    }

    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 12;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // Helper to create procedural spectral grid floor texture
  const createFloorTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Dark obsidian background
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glowing neon grid
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.lineWidth = 2.5;
    const step = 64;
    for (let x = 0; x <= canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Center summoning rune circles
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.arc(0, 0, 160, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 240, 0, Math.PI * 2);
    ctx.stroke();

    // Cardinal tick marks
    ctx.lineWidth = 3;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      const r1 = 220;
      const r2 = 255;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.stroke();
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  // Helper to create glowing portal vortex texture
  const createVortexTexture = (colorHex) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, colorHex);
    grad.addColorStop(0.8, `${colorHex}55`);
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 760;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050711);
    scene.fog = new THREE.FogExp2(0x050711, 0.024);
    sceneRef.current = scene;

    // 2. Camera: Angled isometric perspective looking down at arena
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
    camera.position.set(0, 18, 15.5);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x3b0764, 1.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xc7d2fe, 1.1);
    directionalLight.position.set(4, 18, 8);
    scene.add(directionalLight);

    // 5. Floor Arena: 28 x 24 units
    const floorTexture = createFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(28, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.5,
      metalness: 0.15
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    scene.add(floorMesh);

    // Sleek outer perimeter energy rail
    const railMat = new THREE.MeshBasicMaterial({ color: 0x7e22ce, transparent: true, opacity: 0.65 });
    const rails = [
      { geo: new THREE.BoxGeometry(28, 0.3, 0.3), pos: [0, 0.15, -12] },
      { geo: new THREE.BoxGeometry(28, 0.3, 0.3), pos: [0, 0.15, 12] },
      { geo: new THREE.BoxGeometry(0.3, 0.3, 24), pos: [-14, 0.15, 0] },
      { geo: new THREE.BoxGeometry(0.3, 0.3, 24), pos: [14, 0.15, 0] }
    ];
    rails.forEach((r) => {
      const m = new THREE.Mesh(r.geo, railMat);
      m.position.set(...r.pos);
      scene.add(m);
    });

    // 4 Corner Spectral Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.65, 3.2, 16);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.3,
      metalness: 0.2
    });
    const flameGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });

    const cornerCoords = [
      [-13, -11],
      [13, -11],
      [-13, 11],
      [13, 11]
    ];
    cornerCoords.forEach(([cx, cz]) => {
      const pMesh = new THREE.Mesh(pillarGeo, pillarMat);
      pMesh.position.set(cx, 1.6, cz);
      scene.add(pMesh);

      const fMesh = new THREE.Mesh(flameGeo, flameMat);
      fMesh.position.set(cx, 3.4, cz);
      scene.add(fMesh);

      const pLight = new THREE.PointLight(0xa855f7, 0.6, 5);
      pLight.position.set(cx, 3.5, cz);
      scene.add(pLight);
    });

    // 6. Ambient Floating Ecto-Motes (3D Particle Dust)
    const dustCount = 140;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 26;
      dustPositions[i + 1] = Math.random() * 8 + 0.2;
      dustPositions[i + 2] = (Math.random() - 0.5) * 22;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xd8b4fe,
      size: 0.24,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // 7. Assemble 3D Ghost Avatar
    const ghostGroup = new THREE.Group();

    // Body: Glossy White / Spectral Lavender Dome
    const bodyGeo = new THREE.SphereGeometry(0.85, 32, 24);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.12,
      metalness: 0.08,
      emissive: 0xc084fc,
      emissiveIntensity: 0.38
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.scale.set(1, 1.15, 1);
    bodyMesh.position.y = 0.4;
    ghostGroup.add(bodyMesh);

    // Wavy ghost skirt ring of ruffles
    const skirtGeo = new THREE.SphereGeometry(0.24, 16, 12);
    const skirtRuffles = [];
    const ruffleCount = 7;
    for (let i = 0; i < ruffleCount; i++) {
      const angle = (i * Math.PI * 2) / ruffleCount;
      const rMesh = new THREE.Mesh(skirtGeo, bodyMat);
      rMesh.position.set(Math.cos(angle) * 0.55, -0.42, Math.sin(angle) * 0.55);
      ghostGroup.add(rMesh);
      skirtRuffles.push(rMesh);
    }

    // Cute Dark Eyes
    const eyeGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const eyeGlintGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const eyeGlintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Left eye
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.28, 0.48, 0.72);
    ghostGroup.add(leftEye);
    const leftGlint = new THREE.Mesh(eyeGlintGeo, eyeGlintMat);
    leftGlint.position.set(-0.25, 0.52, 0.81);
    ghostGroup.add(leftGlint);

    // Right eye
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.28, 0.48, 0.72);
    ghostGroup.add(rightEye);
    const rightGlint = new THREE.Mesh(eyeGlintGeo, eyeGlintMat);
    rightGlint.position.set(0.31, 0.52, 0.81);
    ghostGroup.add(rightGlint);

    // Cute blush cheeks
    const blushGeo = new THREE.CircleGeometry(0.08, 16);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, side: THREE.DoubleSide });
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.44, 0.35, 0.65);
    leftBlush.rotation.y = -0.4;
    ghostGroup.add(leftBlush);
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.44, 0.35, 0.65);
    rightBlush.rotation.y = 0.4;
    ghostGroup.add(rightBlush);

    // Floating Golden/Purple Halo
    const haloGeo = new THREE.TorusGeometry(0.46, 0.05, 16, 32);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    haloMesh.rotation.y = 0.15;
    haloMesh.position.y = 1.38;
    ghostGroup.add(haloMesh);

    // Ghost Point Light illuminating floor underneath
    const ghostLight = new THREE.PointLight(0xd8b4fe, 1.5, 7);
    ghostLight.position.y = 0.5;
    ghostGroup.add(ghostLight);

    ghostGroup.position.set(0, 1.2, 0);
    scene.add(ghostGroup);
    ghostRef.current = ghostGroup;

    // 8. Construct 4 3D Portal Archways
    // North (Top), South (Bottom), West (Left), East (Right)
    const portalConfigs = [
      { key: 'top', pos: [0, 0, -10.2], rotY: 0, width: 10, height: 3.6, triggerBox: { minX: -5.2, maxX: 5.2, minZ: -12.2, maxZ: -8.8 } },
      { key: 'bottom', pos: [0, 0, 10.2], rotY: Math.PI, width: 10, height: 3.6, triggerBox: { minX: -5.2, maxX: 5.2, minZ: 8.8, maxZ: 12.2 } },
      { key: 'left', pos: [-11.8, 0, 0], rotY: Math.PI / 2, width: 8.2, height: 3.6, triggerBox: { minX: -13.8, maxX: -10.2, minZ: -4.5, maxZ: 4.5 } },
      { key: 'right', pos: [11.8, 0, 0], rotY: -Math.PI / 2, width: 8.2, height: 3.6, triggerBox: { minX: 10.2, maxX: 13.8, minZ: -4.5, maxZ: 4.5 } }
    ];

    const portalMeshes = [];
    portalConfigs.forEach((cfg) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(...cfg.pos);
      pGroup.rotation.y = cfg.rotY;

      // 3D Arch frame: two vertical pillars + horizontal crossbar
      const archMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        emissive: 0x581c87,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });

      const colGeo = new THREE.BoxGeometry(0.7, cfg.height, 0.7);
      const leftCol = new THREE.Mesh(colGeo, archMat);
      leftCol.position.set(-cfg.width / 2, cfg.height / 2, 0);
      pGroup.add(leftCol);

      const rightCol = new THREE.Mesh(colGeo, archMat);
      rightCol.position.set(cfg.width / 2, cfg.height / 2, 0);
      pGroup.add(rightCol);

      const topGeo = new THREE.BoxGeometry(cfg.width + 0.7, 0.6, 0.7);
      const topBar = new THREE.Mesh(topGeo, archMat);
      topBar.position.set(0, cfg.height, 0);
      pGroup.add(topBar);

      // Inner Swirling Energy Vortex Plane
      const vortexGeo = new THREE.PlaneGeometry(cfg.width - 0.2, cfg.height - 0.2);
      const vortexMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide
      });
      const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
      vortexMesh.position.set(0, cfg.height / 2, 0);
      pGroup.add(vortexMesh);

      // Portal Glowing Light
      const pLight = new THREE.PointLight(0xa855f7, 1.4, 8);
      pLight.position.set(0, cfg.height / 2, 0.6);
      pGroup.add(pLight);

      // 3D Text Billboard Sprite hovering above the portal
      const spriteMat = new THREE.SpriteMaterial({ transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, cfg.height + 1.35, 0);
      sprite.scale.set(cfg.key === 'left' || cfg.key === 'right' ? 8.2 : 9.6, 2.6, 1);
      pGroup.add(sprite);

      scene.add(pGroup);

      portalMeshes.push({
        key: cfg.key,
        group: pGroup,
        archMat,
        vortexMesh,
        vortexMat,
        pLight,
        sprite,
        triggerBox: cfg.triggerBox
      });
    });

    portalsRef.current = portalMeshes;

    // 8b. Click / Tap Target Ring Indicator on Floor
    const targetRingGeo = new THREE.RingGeometry(0.45, 0.68, 32);
    const targetRingMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const targetRingMesh = new THREE.Mesh(targetRingGeo, targetRingMat);
    targetRingMesh.rotation.x = -Math.PI / 2;
    targetRingMesh.position.y = 0.06;
    targetRingMesh.visible = false;
    scene.add(targetRingMesh);

    // 8c. Single Mouse Click / Touch Tap Raycaster to Move Ghost Towards Answer
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeIntersect = new THREE.Vector3();

    const portalCenters = {
      top: { x: 0, z: -10.4 },
      bottom: { x: 0, z: 10.4 },
      left: { x: -12.0, z: 0 },
      right: { x: 12.0, z: 0 }
    };

    const handlePointerDown = (e) => {
      if (isTransitioningRef.current || !cameraRef.current || !rendererRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, cameraRef.current);

      // 1. Direct click/tap on a 3D portal arch, vortex, or floating answer sign
      for (let i = 0; i < portalMeshes.length; i++) {
        const pm = portalMeshes[i];
        const hits = raycaster.intersectObjects(pm.group.children, true);
        if (hits.length > 0) {
          const dest = portalCenters[pm.key];
          physicsRef.current.targetX = dest.x;
          physicsRef.current.targetZ = dest.z;
          return;
        }
      }

      // 2. Click/tap on the arena floor plane (y = 0)
      if (raycaster.ray.intersectPlane(floorPlane, planeIntersect)) {
        let tx = Math.max(-12.6, Math.min(12.6, planeIntersect.x));
        let tz = Math.max(-10.6, Math.min(10.6, planeIntersect.z));

        // Snap straight into a portal if clicked/tapped near it
        for (const center of Object.values(portalCenters)) {
          if (Math.hypot(tx - center.x, tz - center.z) < 4.8) {
            tx = center.x;
            tz = center.z;
            break;
          }
        }

        physicsRef.current.targetX = tx;
        physicsRef.current.targetZ = tz;
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 9. Resize Handling via ResizeObserver
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 10. Main Animation and Physics Render Loop
    let time = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      time += 0.035;

      const p = physicsRef.current;
      const keys = keysRef.current;
      const ghost = ghostRef.current;

      // 3D Physics update when not transitioning
      if (!isTransitioningRef.current) {
        const hasManualKeys = keys.up || keys.down || keys.left || keys.right;
        if (hasManualKeys) {
          p.targetX = null;
          p.targetZ = null;
          if (keys.up) p.vz -= p.speed;
          if (keys.down) p.vz += p.speed;
          if (keys.left) p.vx -= p.speed;
          if (keys.right) p.vx += p.speed;
        } else if (p.targetX !== null && p.targetZ !== null) {
          const dx = p.targetX - p.x;
          const dz = p.targetZ - p.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0.25) {
            p.vx += (dx / dist) * (p.speed * 1.15);
            p.vz += (dz / dist) * (p.speed * 1.15);
          } else {
            p.targetX = null;
            p.targetZ = null;
          }
        }
      } else {
        p.targetX = null;
        p.targetZ = null;
      }

      // Update floor click/tap target ring indicator
      if (p.targetX !== null && p.targetZ !== null && !isTransitioningRef.current) {
        targetRingMesh.visible = true;
        targetRingMesh.position.set(p.targetX, 0.06, p.targetZ);
        const ringScale = 1 + Math.sin(time * 6) * 0.15;
        targetRingMesh.scale.set(ringScale, ringScale, 1);
      } else {
        targetRingMesh.visible = false;
      }

      // Cap speed and apply friction
      const currentSpeed = Math.hypot(p.vx, p.vz);
      if (currentSpeed > p.maxSpeed) {
        p.vx = (p.vx / currentSpeed) * p.maxSpeed;
        p.vz = (p.vz / currentSpeed) * p.maxSpeed;
      }
      p.vx *= p.friction;
      p.vz *= p.friction;

      p.x += p.vx;
      p.z += p.vz;

      // Arena boundary clamping
      p.x = Math.max(-12.8, Math.min(12.8, p.x));
      p.z = Math.max(-10.8, Math.min(10.8, p.z));

      // Update Ghost Transform in 3D
      if (ghost) {
        ghost.position.x = p.x;
        ghost.position.z = p.z;
        // Natural spectral vertical hover bobbing
        ghost.position.y = 1.15 + Math.sin(time * 3.2) * 0.16;

        // Turn towards movement direction smoothly
        if (Math.hypot(p.vx, p.vz) > 0.015) {
          p.targetRotationY = Math.atan2(p.vx, p.vz);
        }
        ghost.rotation.y += (p.targetRotationY - ghost.rotation.y) * 0.14;

        // Dynamic banking / tilt based on motion velocity
        ghost.rotation.z = -p.vx * 0.8;
        ghost.rotation.x = p.vz * 0.6;

        // Ripple skirt ruffles
        for (let i = 0; i < skirtRuffles.length; i++) {
          skirtRuffles[i].position.y = -0.42 + Math.sin(time * 4.5 + i) * 0.08;
        }

        // Halo gentle float
        haloMesh.position.y = 1.38 + Math.sin(time * 2.8) * 0.06;
      }

      // Ambient dust particles slow upward drift
      const dustPos = dustGeo.attributes.position.array;
      for (let i = 1; i < dustCount * 3; i += 3) {
        dustPos[i] += 0.012;
        if (dustPos[i] > 8.5) dustPos[i] = 0.2;
      }
      dustGeo.attributes.position.needsUpdate = true;

      // Pulse and rotate portal vortices
      portalMeshes.forEach((pObj, idx) => {
        const pulse = Math.sin(time * 2.5 + idx) * 0.15 + 0.85;
        pObj.vortexMat.opacity = 0.48 * pulse;
        pObj.pLight.intensity = 1.3 * pulse;
      });

      // Smooth Camera Follow: glides slightly with ghost movement
      if (camera && ghost) {
        const targetCamX = ghost.position.x * 0.28;
        const targetCamZ = 15.5 + ghost.position.z * 0.28;
        camera.position.x += (targetCamX - camera.position.x) * 0.06;
        camera.position.z += (targetCamZ - camera.position.z) * 0.06;
        camera.lookAt(ghost.position.x * 0.15, 0.8, ghost.position.z * 0.15);
      }

      // Check 3D portal collisions
      if (!isTransitioningRef.current && ghost) {
        for (let i = 0; i < portalMeshes.length; i++) {
          const pm = portalMeshes[i];
          const tb = pm.triggerBox;
          if (
            ghost.position.x >= tb.minX &&
            ghost.position.x <= tb.maxX &&
            ghost.position.z >= tb.minZ &&
            ghost.position.z <= tb.maxZ
          ) {
            const hitZone = spriteMapRef.current[pm.key];
            if (hitZone && onZoneHitRef.current) {
              onZoneHitRef.current(hitZone);
              break;
            }
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      targetRingGeo.dispose();
      targetRingMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      bodyGeo.dispose();
      bodyMat.dispose();
    };
  }, []);

  // Update Portal Billboards when scenario changes
  useEffect(() => {
    if (!scenario || !portalsRef.current.length) return;

    // Reset ghost position to room center on scenario change
    physicsRef.current.x = 0;
    physicsRef.current.z = 0;
    physicsRef.current.vx = 0;
    physicsRef.current.vz = 0;
    physicsRef.current.targetX = null;
    physicsRef.current.targetZ = null;
    if (ghostRef.current) {
      ghostRef.current.position.set(0, 1.2, 0);
    }

    const zones = scenario.zones || [];
    const topZone = zones.find((z) => z.position === 'top');
    const bottomZone = zones.find((z) => z.position === 'bottom');
    const leftZone = zones.find((z) => z.position === 'left');
    const rightZone = zones.find((z) => z.position === 'right');

    const mapping = {
      top: topZone,
      bottom: bottomZone,
      left: leftZone,
      right: rightZone
    };
    spriteMapRef.current = mapping;

    portalsRef.current.forEach((pm) => {
      const zone = mapping[pm.key];
      if (!zone) return;

      // Update text billboard texture (Scenario action text only, strictly no core dimension labels!)
      const billboardTex = createPortalBillboardTexture(zone.text, zone.color);
      pm.sprite.material.map = billboardTex;
      pm.sprite.material.needsUpdate = true;

      // Update portal vortex texture & lighting color
      const vortexTex = createVortexTexture(zone.color);
      pm.vortexMesh.material.map = vortexTex;
      pm.vortexMesh.material.needsUpdate = true;
      pm.pLight.color.set(zone.color);
      pm.archMat.emissive.set(zone.color);
    });
  }, [scenario, scenarioIndex]);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full min-h-[360px] sm:min-h-[460px] cursor-crosshair overflow-hidden rounded-2xl"
    />
  );
}
