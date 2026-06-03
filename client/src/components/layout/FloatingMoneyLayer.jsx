import { motion } from 'framer-motion';

const SYMBOLS = ['$', '₹', '€', '£', '¥', '₿', '💵', '💰'];

export default function FloatingMoneyLayer() {
  const floatingItems = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    x: Math.random() * 100, // percentage
    size: Math.random() * 32 + 16, // 16px to 48px
    duration: Math.random() * 20 + 15, // 15s to 35s
    delay: Math.random() * -20, // Negative delay to pre-populate the screen immediately
    opacity: Math.random() * 0.1 + 0.08, // 0.08 to 0.18
    color: Math.random() > 0.5 ? 'text-teal' : 'text-amber',
    sway: Math.random() * 60 - 30, // ±30px
    rotation: Math.random() * 360
  }));

  return (
    <div className="fixed inset-0 z-0 pointer-events-auto overflow-hidden select-none">
      {floatingItems.map((item) => (
        <motion.div
          key={item.id}
          className={`absolute ${item.color} cursor-pointer font-display font-bold flex items-center justify-center drop-shadow-lg`}
          style={{
            left: `${item.x}%`,
            bottom: `-10%`,
            fontSize: `${item.size}px`,
            opacity: item.opacity,
          }}
          initial={{ y: '0vh', x: 0, rotate: 0 }}
          animate={{
            y: ['0vh', '-120vh'],
            x: [0, item.sway, 0, -item.sway, 0],
            rotate: [0, item.rotation]
          }}
          transition={{
            y: { duration: item.duration, repeat: Infinity, ease: "linear", delay: item.delay },
            x: { duration: item.duration * 0.8, repeat: Infinity, ease: "easeInOut", delay: item.delay },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
          whileHover={{
            scale: 1.8,
            opacity: 0.6,
            transition: { duration: 0.2 }
          }}
        >
          {item.symbol}
        </motion.div>
      ))}
    </div>
  );
}
