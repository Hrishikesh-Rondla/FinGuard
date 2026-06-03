import { motion } from 'framer-motion';

export default function NebulaBackground({ children }) {
  // Generate 200 random particles
  const particles = Array.from({ length: 200 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    sway: Math.random() * 40 - 20,
  }));

  return (
    <div className="relative min-h-screen w-full bg-deep-indigo overflow-hidden">
      {/* SVG Noise Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.08] mix-blend-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Breathing Nebula Blobs */}
      <motion.div
        className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-teal/20 blur-[120px] mix-blend-screen z-0 pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet/20 blur-[150px] mix-blend-screen z-0 pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="fixed top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-cobalt/30 blur-[100px] mix-blend-screen z-0 pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/40"
            style={{
              left: `${p.x}%`,
              bottom: `-5%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: ['0vh', '-110vh'],
              x: ['0px', `${p.sway}px`]
            }}
            transition={{
              y: { duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay },
              x: { duration: p.duration / 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: p.delay }
            }}
          />
        ))}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
