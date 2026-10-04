import React, { useEffect, useRef } from "react";
import { Award, Flame, Sparkles, X, Trophy } from "lucide-react";

interface CelebrationConfettiProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  minutesAchieved?: number;
  goalMinutes?: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  shape: "rect" | "circle" | "star";
  opacity: number;
}

export const CelebrationConfetti: React.FC<CelebrationConfettiProps> = ({
  isOpen,
  onClose,
  title = "Daily Reading Goal Achieved!",
  subtitle = "Outstanding focus! You've met your daily reading target for today.",
  minutesAchieved,
  goalMinutes,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Play gentle celebratory chime with Web Audio API
  useEffect(() => {
    if (!isOpen) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;

        // Chime sequence: C5, E5, G5, C6 (Major arpeggio of triumph)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.55);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.6);
        });

        // Clean up audio context
        setTimeout(() => {
          if (ctx.state !== "closed") {
            ctx.close().catch(() => {});
          }
        }, 2000);
      }
    } catch {
      // Audio context might be restricted before user gesture; fail silently
    }
  }, [isOpen]);

  // Particle canvas animation
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const colors = [
      "#f97316", // orange-500
      "#eab308", // yellow-500
      "#10b981", // emerald-500
      "#3b82f6", // blue-500
      "#ec4899", // pink-500
      "#8b5cf6", // purple-500
      "#f59e0b", // amber-500
    ];

    const particles: Particle[] = [];
    const count = Math.min(120, Math.floor(window.innerWidth / 10));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * (canvas.height * 0.6),
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3.5 + 2.5,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 6,
        shape: Math.random() > 0.6 ? "rect" : Math.random() > 0.3 ? "circle" : "star",
        opacity: 1,
      });
    }

    const startTime = Date.now();
    const duration = 6500; // 6.5s animation

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        onClose();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        // Gravity & sway
        p.vx += Math.sin(p.y * 0.02) * 0.05;

        // Fade out near end of life
        if (elapsed > duration - 1500) {
          p.opacity = Math.max(0, (duration - elapsed) / 1500);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 4-point sparkle star
          ctx.beginPath();
          for (let s = 0; s < 4; s++) {
            ctx.rotate(Math.PI / 2);
            ctx.lineTo(p.size, 0);
            ctx.lineTo(p.size * 0.3, p.size * 0.3);
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();

        // Wrap around top if needed before duration ends
        if (p.y > canvas.height + 20 && elapsed < duration - 2000) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto bg-stone-900/40 backdrop-blur-xs animate-fade-in">
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Celebratory Modal Card */}
      <div className="relative z-20 max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-emerald-500/40 text-center overflow-hidden transform animate-in zoom-in-95 duration-300">
        {/* Glow background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-emerald-100 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close celebration"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Floating Animated Trophy & Fire Icon */}
        <div className="relative mx-auto w-20 h-20 mb-4">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-400 to-emerald-400 blur-md opacity-70 animate-pulse" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25">
            <Trophy className="w-10 h-10 text-white fill-white/20 animate-bounce" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white shadow-sm">
            <Flame className="w-4 h-4 fill-current" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Goal Achieved!</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-sm mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* Stats summary chip */}
        {minutesAchieved !== undefined && goalMinutes !== undefined && (
          <div className="mt-5 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 flex items-center justify-around">
            <div className="text-center">
              <span className="block text-xl font-black text-emerald-600">
                {minutesAchieved}m
              </span>
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Time Read Today
              </span>
            </div>
            <div className="w-px h-8 bg-stone-200" />
            <div className="text-center">
              <span className="block text-xl font-black text-stone-800">
                {goalMinutes}m
              </span>
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Target Goal
              </span>
            </div>
            <div className="w-px h-8 bg-stone-200" />
            <div className="text-center">
              <span className="block text-xl font-black text-orange-500">
                100%+
              </span>
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Status
              </span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Awesome, Keep It Up!
          </button>
        </div>
      </div>
    </div>
  );
};
