import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const EMOTION_COLORS = {
  Happy: '#10b981',
  Excited: '#f59e0b',
  Sad: '#6366f1',
  Angry: '#dc2626',
  Bored: '#6b7280',
};

const EMOTION_ICONS = {
  Happy: '😊',
  Excited: '🤩',
  Sad: '😢',
  Angry: '😠',
  Bored: '😴',
};

export default function EmotionBar({ emotions }) {
  if (!emotions || Object.keys(emotions).length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-white/40 text-sm">No emotion data yet</p>
      </div>
    );
  }

  const data = Object.entries(emotions).map(([name, value]) => ({
    name,
    value,
    icon: EMOTION_ICONS[name] || '😐',
    color: EMOTION_COLORS[name] || '#6b7280',
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6"
    >
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
        Emotion Breakdown
      </h3>

      {/* Icon Labels */}
      <div className="flex items-center justify-around mb-4">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <span className="text-xl">{item.icon}</span>
            <p className="text-[10px] text-white/40 mt-1">{item.name}</p>
          </div>
        ))}
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={24}>
            <XAxis dataKey="name" tick={false} axisLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: '#16161d',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value} reviews`, 'Count']}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1200}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
