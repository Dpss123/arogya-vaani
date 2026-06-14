"use client";
import { useEffect, useRef } from "react";

// DNA double-helix: two luminescent backbone strands + connecting base-pair
// rungs (the twisted-ladder steps that make it read as DNA) + ambient stars.
// three.js dynamic-imported after paint; skipped on touch (CSS fallback shown).
export default function Hero3D() {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let active = true;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (!active || !mount.current) return;
      const el = mount.current;
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      const isMobile = w < 768;   // lighter geometry on phones for smoothness

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
      camera.position.z = 19;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      el.appendChild(renderer.domElement);

      const helix = new THREE.Group();
      scene.add(helix);

      // ── geometry params ──
      const TURNS = 3.2;          // number of full twists
      const HEIGHT = 22;          // vertical span
      const RADIUS = 3.1;         // helix radius
      const NODES = 46;           // base-pair steps (rungs / backbone nodes)
      const angleAt = (f: number) => f * Math.PI * 2 * TURNS;
      const yAt = (f: number) => f * HEIGHT - HEIGHT / 2;

      const disposables: { dispose: () => void }[] = [];

      // ── backbone strands as dense glowing points ──
      const SEG = isMobile ? 260 : 600;
      const a: number[] = [];
      const b: number[] = [];
      for (let i = 0; i <= SEG; i++) {
        const f = i / SEG;
        const t = angleAt(f);
        const y = yAt(f);
        a.push(Math.cos(t) * RADIUS, y, Math.sin(t) * RADIUS);
        b.push(Math.cos(t + Math.PI) * RADIUS, y, Math.sin(t + Math.PI) * RADIUS);
      }
      const geoA = new THREE.BufferGeometry();
      const geoB = new THREE.BufferGeometry();
      geoA.setAttribute("position", new THREE.Float32BufferAttribute(a, 3));
      geoB.setAttribute("position", new THREE.Float32BufferAttribute(b, 3));
      const matA = new THREE.PointsMaterial({ color: 0x00e676, size: 0.16, transparent: true, opacity: 0.95 });
      const matB = new THREE.PointsMaterial({ color: 0x00c4ff, size: 0.16, transparent: true, opacity: 0.95 });
      helix.add(new THREE.Points(geoA, matA));
      helix.add(new THREE.Points(geoB, matB));
      disposables.push(geoA, geoB, matA, matB);

      // ── base-pair rungs (the twisted ladder = "this is DNA") ──
      const rung: number[] = [];
      const nodeA: number[] = [];
      const nodeB: number[] = [];
      for (let i = 0; i <= NODES; i++) {
        const f = i / NODES;
        const t = angleAt(f);
        const y = yAt(f);
        const ax = Math.cos(t) * RADIUS, az = Math.sin(t) * RADIUS;
        const bx = Math.cos(t + Math.PI) * RADIUS, bz = Math.sin(t + Math.PI) * RADIUS;
        rung.push(ax, y, az, bx, y, bz);
        nodeA.push(ax, y, az);
        nodeB.push(bx, y, bz);
      }
      const rungGeo = new THREE.BufferGeometry();
      rungGeo.setAttribute("position", new THREE.Float32BufferAttribute(rung, 3));
      const rungMat = new THREE.LineBasicMaterial({ color: 0x2fe0c0, transparent: true, opacity: 0.32 });
      helix.add(new THREE.LineSegments(rungGeo, rungMat));
      disposables.push(rungGeo, rungMat);

      // bright nucleotide nodes where each rung meets a strand
      const nGeoA = new THREE.BufferGeometry();
      const nGeoB = new THREE.BufferGeometry();
      nGeoA.setAttribute("position", new THREE.Float32BufferAttribute(nodeA, 3));
      nGeoB.setAttribute("position", new THREE.Float32BufferAttribute(nodeB, 3));
      const nMatA = new THREE.PointsMaterial({ color: 0x9dffd8, size: 0.34, transparent: true, opacity: 0.9 });
      const nMatB = new THREE.PointsMaterial({ color: 0xa9ecff, size: 0.34, transparent: true, opacity: 0.9 });
      helix.add(new THREE.Points(nGeoA, nMatA));
      helix.add(new THREE.Points(nGeoB, nMatB));
      disposables.push(nGeoA, nGeoB, nMatA, nMatB);

      // slight tilt so the 3D twist reads immediately
      helix.rotation.z = 0.12;

      // ── ambient stars ──
      const stars: number[] = [];
      for (let i = 0; i < (isMobile ? 220 : 600); i++) stars.push((Math.random() - 0.5) * 44, (Math.random() - 0.5) * 44, (Math.random() - 0.5) * 22);
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.Float32BufferAttribute(stars, 3));
      const starMat = new THREE.PointsMaterial({ color: 0x66ffcc, size: 0.05, transparent: true, opacity: 0.38 });
      scene.add(new THREE.Points(starGeo, starMat));
      disposables.push(starGeo, starMat);

      let mx = 0, my = 0, raf = 0;
      const onMove = (e: MouseEvent) => {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
      };
      window.addEventListener("mousemove", onMove);

      const animate = () => {
        helix.rotation.y += 0.006;
        helix.rotation.x += (my * 0.4 - helix.rotation.x) * 0.05;
        helix.rotation.z += (0.12 + mx * 0.25 - helix.rotation.z) * 0.05;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        const W = el.clientWidth || 1;
        const H = el.clientHeight || 1;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("resize", onResize);
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    })();

    return () => { active = false; cleanup(); };
  }, []);

  return <div ref={mount} style={{ width: "100%", height: "100%" }} />;
}
