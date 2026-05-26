import { motion } from 'framer-motion';

export default function SentimentProgress({ positive, negative, label }) {
  const total = positive + negative;
  const percent = total > 0 ? Math.round((positive / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-2"
    >
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">{label}</span>
          <span className="text-sm font-semibold text-white">{percent}% positive</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          className="h-full rounded-full"
          style={{
            background: percent >= 60
              ? 'linear-gradient(90deg, #06b6d4, #10b981)'
              : percent >= 40
              ? 'linear-gradient(90deg, #f59e0b, #eab308)'
              : 'linear-gradient(90deg, #dc2626, #f87171)',
          }}
        />
      </div>
    </motion.div>
  );
}
