"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";

// Reverted to facecap.glb — three.js's ARKit-blendshape face example. Has
// the full 52 morph targets (jawOpen, eyeBlinkLeft/Right, viseme_*) so the
// mouth + blink driver actually works. Swap back to a custom avatar URL
// (and re-enable face animation in the source) when ready.
const DEFAULT_AVATAR = "https://threejs.org/examples/models/gltf/facecap.glb";

type AvatarProps = {
  src?: string;
  charSet?: string;
  color?: string;
  background?: string;
  /** 0..1 mouth-open level; drives morph targets / jaw if present. */
  mouthLevel?: number;
  /** brief nod / lean when this counter increments. */
  reactionTick?: number;
};

// Morph target names we'll try to drive, in priority order. Covers Avaturn,
// Ready Player Me, MetaHuman exports, Mixamo, and generic rigs.
const MOUTH_MORPHS = [
  "mouthOpen",
  "jawOpen",
  "viseme_aa",
  "viseme_O",
  "MouthOpen",
  "JawOpen",
];

const BLINK_LEFT_MORPHS = ["eyeBlinkLeft", "eyeBlink_L", "EyeBlinkLeft"];
const BLINK_RIGHT_MORPHS = ["eyeBlinkRight", "eyeBlink_R", "EyeBlinkRight"];

const JAW_BONES = ["jaw", "Jaw", "mixamorigJaw", "Head_Jaw"];

type MorphRef = { mesh: THREE.Mesh; index: number };

function findMorph(
  mesh: THREE.Mesh,
  names: string[]
): number | null {
  if (!mesh.morphTargetDictionary) return null;
  for (const n of names) {
    const idx = mesh.morphTargetDictionary[n];
    if (typeof idx === "number") return idx;
  }
  return null;
}

export default function Avatar({
  src = DEFAULT_AVATAR,
  charSet = " .:-+*=%@#",
  color = "#00ff7f",
  background = "#000000",
  mouthLevel = 0,
  reactionTick = 0,
}: AvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // refs the animation loop reads; updated by parent props without rebuilding scene
  const mouthLevelRef = useRef(mouthLevel);
  const reactionTickRef = useRef(reactionTick);
  useEffect(() => {
    mouthLevelRef.current = mouthLevel;
  }, [mouthLevel]);
  useEffect(() => {
    reactionTickRef.current = reactionTick;
  }, [reactionTick]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 3.2);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    const effect = new AsciiEffect(renderer, charSet, {
      invert: true,
      resolution: 0.18,
    });
    effect.setSize(width, height);
    effect.domElement.style.color = color;
    effect.domElement.style.backgroundColor = background;
    effect.domElement.style.fontFamily =
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace';
    effect.domElement.style.fontWeight = "700";
    effect.domElement.style.letterSpacing = "0px";
    effect.domElement.style.userSelect = "none";

    mount.appendChild(effect.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(2, 4, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.4);
    rim.position.set(-3, 2, -2);
    scene.add(rim);

    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();
    let model: THREE.Object3D | null = null;
    let headBone: THREE.Bone | null = null;
    let jawBone: THREE.Bone | null = null;
    let leftEye: THREE.Bone | null = null;
    let rightEye: THREE.Bone | null = null;
    const mouthMorphs: MorphRef[] = [];
    const blinkLeftMorphs: MorphRef[] = [];
    const blinkRightMorphs: MorphRef[] = [];
    const lookTarget = new THREE.Vector3(0, 1.0, 0); // updated after model loads
    const cameraWorldPos = new THREE.Vector3();
    const headLookTarget = new THREE.Vector3();
    const tmpQuat = new THREE.Quaternion();

    const ktx2 = new KTX2Loader()
      .setTranscoderPath("/basis/")
      .detectSupport(renderer);
    const loader = new GLTFLoader()
      .setKTX2Loader(ktx2)
      .setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      src,
      (gltf) => {
        model = gltf.scene;
        scene.add(model);

        // Center the model at world origin, then nudge it UP so the face
        // (which sits in the upper portion of the bbox) lands in the upper
        // portion of the rendered frame. Camera stays level at center.
        const rawBox = new THREE.Box3().setFromObject(model);
        const rawCenter = rawBox.getCenter(new THREE.Vector3());
        model.position.sub(rawCenter);

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());

        // Lift the model so face ends up in the upper portion of the frame
        model.position.y += size.y * 0.18;

        // Auto-fit camera distance based on model dimensions.
        const fovRad = (camera.fov * Math.PI) / 180;
        const fitDim = Math.max(size.x, size.y);
        const dist = (fitDim * 1.3) / (2 * Math.tan(fovRad / 2)); // 1.3 = padding
        const aimY = 0;
        const camY = 0;

        camera.position.set(0, camY, dist);
        lookTarget.set(0, aimY, 0);
        camera.lookAt(lookTarget);

        model.traverse((child) => {
          if ((child as THREE.Bone).isBone) {
            const b = child as THREE.Bone;
            // Match Avaturn / Mixamo / RPM bone naming
            if (!headBone && /^(head|mixamorig:?head)$/i.test(b.name)) headBone = b;
            if (!jawBone && JAW_BONES.some((n) => b.name === n)) jawBone = b;
            if (!leftEye && /(lefteye|eye_l|eye\.l|l_eye|eyeleft)$/i.test(b.name)) leftEye = b;
            if (!rightEye && /(righteye|eye_r|eye\.r|r_eye|eyeright)$/i.test(b.name)) rightEye = b;
          }
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            const allMorphs = Object.keys(mesh.morphTargetDictionary);
            console.log(`[avatar] mesh "${mesh.name}" morphs:`, allMorphs);

            const mouth = findMorph(mesh, MOUTH_MORPHS);
            if (mouth !== null) mouthMorphs.push({ mesh, index: mouth });
            const bl = findMorph(mesh, BLINK_LEFT_MORPHS);
            if (bl !== null) blinkLeftMorphs.push({ mesh, index: bl });
            const br = findMorph(mesh, BLINK_RIGHT_MORPHS);
            if (br !== null) blinkRightMorphs.push({ mesh, index: br });
          }
        });
        const allBones: string[] = [];
        model.traverse((c) => {
          if ((c as THREE.Bone).isBone) allBones.push((c as THREE.Bone).name);
        });
        console.log(
          `[avatar] resolved: mouth=${mouthMorphs.length} blinkL=${blinkLeftMorphs.length} blinkR=${blinkRightMorphs.length} jawBone=${jawBone ? "yes" : "no"} headBone=${headBone ? "yes" : "no"} eyes=${(leftEye ? 1 : 0) + (rightEye ? 1 : 0)}`
        );
        console.log(`[avatar] all bones (${allBones.length}): ${allBones.join(", ")}`);

        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const source =
            gltf.animations.find((a) => /idle|stand|breath/i.test(a.name)) ||
            gltf.animations[0];
          // Strip any morphTargetInfluences tracks — we drive face morphs
          // procedurally (mouth from TTS level, eyes from the blink scheduler)
          // and don't want the bundled animation fighting our values.
          // Bone-based body tracks are kept so future body rigs still idle.
          const tracks = source.tracks.filter(
            (t) => !t.name.includes(".morphTargetInfluences")
          );
          if (tracks.length > 0) {
            const cleaned = new THREE.AnimationClip(
              source.name,
              source.duration,
              tracks
            );
            mixer.clipAction(cleaned).play();
          }
        }
      },
      undefined,
      (err) => {
        console.error("avatar load failed", err);
      }
    );

    let t = 0;
    let lastReactionTick = reactionTickRef.current;
    let reactionPhase = 0; // seconds since last reaction

    // Blink scheduling: pick a next-blink time, run a quick close/open
    // envelope, then re-roll. Humans blink every ~3-6s and the closure
    // takes ~150ms.
    let nextBlinkAt = 1.0 + Math.random() * 2.0;
    let blinkPhase = -1; // -1 = not blinking; otherwise seconds into the blink

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      t += dt;
      if (mixer) mixer.update(dt);

      // ---- Mouth (smoothed) ----
      // MOUTH_GAIN scales the incoming level. The envelope tops out around
      // 0.55; we further dampen here so even peaks read as natural talking,
      // not yelling. Single knob if you want stronger/softer mouth motion.
      const MOUTH_GAIN = 0.55;
      const target = Math.min(1, mouthLevelRef.current * MOUTH_GAIN);
      const smooth = 0.25;
      if (mouthMorphs.length > 0) {
        for (const { mesh, index } of mouthMorphs) {
          const cur = mesh.morphTargetInfluences![index] ?? 0;
          mesh.morphTargetInfluences![index] = cur + (target - cur) * smooth;
        }
      } else if (jawBone) {
        const cur = jawBone.rotation.x;
        const want = -target * 0.3;
        jawBone.rotation.x = cur + (want - cur) * smooth;
      }

      // ---- Blinks ----
      if (blinkLeftMorphs.length > 0 || blinkRightMorphs.length > 0) {
        if (blinkPhase < 0 && t >= nextBlinkAt) {
          blinkPhase = 0;
        }
        let blinkValue = 0;
        if (blinkPhase >= 0) {
          const blinkDur = 0.18;
          // Triangle envelope: 0 → 1 → 0 across blinkDur seconds
          const k = blinkPhase / blinkDur;
          blinkValue = k < 0.5 ? k * 2 : (1 - k) * 2;
          blinkPhase += dt;
          if (blinkPhase >= blinkDur) {
            blinkPhase = -1;
            nextBlinkAt = t + 2.2 + Math.random() * 3.5;
          }
        }
        for (const { mesh, index } of blinkLeftMorphs) {
          mesh.morphTargetInfluences![index] = blinkValue;
        }
        for (const { mesh, index } of blinkRightMorphs) {
          mesh.morphTargetInfluences![index] = blinkValue;
        }
      }

      // ---- Reaction nod (fires when reactionTick changes) ----
      if (reactionTickRef.current !== lastReactionTick) {
        lastReactionTick = reactionTickRef.current;
        reactionPhase = 0;
      }
      reactionPhase += dt;
      const nod =
        reactionPhase < 0.6
          ? Math.sin((reactionPhase / 0.6) * Math.PI) * 0.18
          : 0;

      // ---- Body orientation: rotate the whole model so it faces the camera.
      // Each frame we compute the yaw needed to point the body's +Z at the
      // camera's XZ position, add tiny sway for organic motion, plus a
      // tunable offset to compensate for Avaturn's bind-pose rotation. ----
      const BODY_YAW_OFFSET = 0; // adjust if body lands rotated after lookAt
      const bodyYawSway = Math.sin(t * 0.13 + 1.1) * 0.006;
      const bodyPitch = Math.sin(t * 0.19 + 0.7) * 0.008;
      const bodyRoll = Math.sin(t * 0.11 + 2.3) * 0.006;

      if (model) {
        camera.getWorldPosition(cameraWorldPos);
        const dx = cameraWorldPos.x - model.position.x;
        const dz = cameraWorldPos.z - model.position.z;
        const yawToCamera = Math.atan2(dx, dz);
        model.rotation.y = yawToCamera + bodyYawSway + BODY_YAW_OFFSET;
        model.rotation.x = bodyPitch + nod * 0.2;
        model.rotation.z = bodyRoll;
        // Flush so the head bone sees the updated body world transform
        // when it computes its lookAt below.
        model.updateMatrixWorld(true);
      }

      // ---- Eye + head targeting: lock to camera so the avatar makes
      // eye contact regardless of body pose or Avaturn's baked-in bind.
      // Eyes lock fully each frame. Head also targets camera + nod overlay.
      camera.getWorldPosition(cameraWorldPos);

      if (headBone) {
        const h = headBone as THREE.Bone;
        // Head bone pivots at the base of the skull, but the FACE/eyes sit
        // above the pivot. lookAt straight at camera makes the face aim
        // slightly HIGH. Drop the target ~12cm so the face lands on you.
        headLookTarget.copy(cameraWorldPos);
        headLookTarget.y -= 0.12;
        h.lookAt(headLookTarget);
        h.rotateX(nod * 0.3);
        h.updateMatrixWorld(true);
      }

      // Eyes target the camera directly — they sit roughly at camera height
      // and don't need the head's pivot offset.
      if (leftEye) (leftEye as THREE.Bone).lookAt(cameraWorldPos);
      if (rightEye) (rightEye as THREE.Bone).lookAt(cameraWorldPos);
      void tmpQuat; // reserved for future slerp-based softening

      // very subtle camera horizontal drift — keeps it from feeling locked
      // without ever moving meaningfully off-axis from the avatar's face
      camera.position.x = Math.sin(t * 0.15) * 0.03;
      camera.lookAt(lookTarget);

      effect.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      effect.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (mount.contains(effect.domElement)) {
        mount.removeChild(effect.domElement);
      }
      renderer.dispose();
    };
  }, [src, charSet, color, background]);

  return <div ref={mountRef} className="w-full h-full" />;
}
