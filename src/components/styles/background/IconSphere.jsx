import { useEffect, useRef } from "react";
import {
    CloudRain,
    Waves,
    Wind,
    Flame,
    Mountain,
    Zap,
    ZapOff,
    AlertTriangle,
    LifeBuoy,
    Ambulance,
    Siren,
    Users,
    HeartPulse,
    Activity,
    ShieldAlert,
    Radio,
    Cloud,
    CloudLightning,
    Thermometer,
    Tornado,
} from "lucide-react";

const ICONS = [
    CloudRain, Waves, Wind, Flame, Mountain, Zap, ZapOff, AlertTriangle,
    LifeBuoy, Ambulance, Siren, Users, HeartPulse, Activity, ShieldAlert,
    Radio, Cloud, CloudLightning, Thermometer, Tornado,
    CloudRain, Flame, AlertTriangle, LifeBuoy, Waves, Mountain, Siren, Ambulance,
    Tornado, Zap, ShieldAlert, HeartPulse,
];

export function IconSphere({ radius = 200 } = {}) {
    const containerRef = useRef(null);
    const pointsRef = useRef([]);
    const rotationRef = useRef({ x: -0.2, y: 0 });
    const targetRotRef = useRef({ x: -0.2, y: 0 });
    const draggingRef = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });
    const velocityRef = useRef({ x: 0, y: 0.004 });

    // Fibonacci sphere distribution
    useEffect(() => {
        const N = ICONS.length;
        const pts = [];
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < N; i++) {
            const y = 1 - (i / (N - 1)) * 2;
            const r = Math.sqrt(1 - y * y);
            const theta = golden * i;
            pts.push({
                x: Math.cos(theta) * r,
                y,
                z: Math.sin(theta) * r,
                Icon: ICONS[i],
            });
        }
        pointsRef.current = pts;
    }, []);


    useEffect(() => {
        let raf = 0;
        const startTime = performance.now();
        const INTRO_MS = 1400;
        const render = () => {
            const container = containerRef.current;
            if (!container) return;

            const elapsed = performance.now() - startTime;
            const t = Math.min(1, elapsed / INTRO_MS);
            // easeOutCubic with a slight overshoot for the explosion feel
            const eased =
                t < 1
                    ? 1 - Math.pow(1 - t, 3) + Math.sin(t * Math.PI) * 0.08 * (1 - t)
                    : 1;

            if (!draggingRef.current) {
                // spin faster during the intro to sell the explosion
                const spinBoost = t < 1 ? 1 + (1 - t) * 4 : 1;
                rotationRef.current.y += velocityRef.current.y * spinBoost;
                rotationRef.current.x += velocityRef.current.x;
                rotationRef.current.x += (targetRotRef.current.x - rotationRef.current.x) * 0.02;
            }

            const cx = Math.cos(rotationRef.current.x);
            const sx = Math.sin(rotationRef.current.x);
            const cy = Math.cos(rotationRef.current.y);
            const sy = Math.sin(rotationRef.current.y);

            const children = container.children;
            const pts = pointsRef.current;
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i];
                // rotate around Y
                let x = p.x * cy + p.z * sy;
                let z = -p.x * sy + p.z * cy;
                let y = p.y;
                // rotate around X
                const y2 = y * cx - z * sx;
                const z2 = y * sx + z * cx;
                y = y2;
                z = z2;

                const el = children[i];
                if (!el) continue;
                const scale = 0.55 + (z + 1) * 0.32;
                const opacity = (0.25 + (z + 1) * 0.38) * Math.min(1, t * 1.5);
                el.style.transform = `translate3d(${x * radius * eased}px, ${y * radius * eased}px, 0) scale(${scale * (0.2 + 0.8 * eased)})`;
                el.style.opacity = String(opacity);
                el.style.zIndex = String(Math.round((z + 1) * 500));
                el.style.filter = `blur(${Math.max(0, (1 - z) * 0.6)}px)`;
            }

            raf = requestAnimationFrame(render);
        };
        raf = requestAnimationFrame(render);
        return () => cancelAnimationFrame(raf);
    }, [radius]);

    const onPointerDown = (e) => {
        draggingRef.current = true;
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        e.target.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e) => {
        if (!draggingRef.current) return;
        const dx = e.clientX - lastPosRef.current.x;
        const dy = e.clientY - lastPosRef.current.y;
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        rotationRef.current.y += dx * 0.008;
        rotationRef.current.x += dy * 0.008;
        velocityRef.current = { x: dy * 0.0008, y: dx * 0.0015 };
    };
    const onPointerUp = () => {
        draggingRef.current = false;
        // restore subtle auto spin while keeping inertia direction
        const vy = velocityRef.current.y;
        velocityRef.current = {
            x: 0,
            y: Math.abs(vy) < 0.002 ? 0.004 : vy,
        };
    };

    return (
        <div
            className="relative flex items-center justify-center select-none animate-float"
            style={{ width: radius * 2 + 80, height: radius * 2 + 80 }}
        >
            <div
                ref={containerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="relative cursor-grab active:cursor-grabbing"
                style={{
                    width: radius * 2,
                    height: radius * 2,
                    transformStyle: "preserve-3d",
                }}
            >
                {ICONS.map((Icon, i) => (
                    <div
                        key={i}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary"
                        style={{ willChange: "transform, opacity" }}
                    >
                        <Icon className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                ))}
            </div>
        </div>
    );
}