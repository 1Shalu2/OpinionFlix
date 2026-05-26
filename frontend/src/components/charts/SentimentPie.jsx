import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#06b6d4', '#dc2626'];

export default function SentimentPie({ positive, negative }) {
  const total = positive + negative;
  const data = [
    { name: 'Positive', value: positive, color: '#06b6d4' },
    { name: 'Negative', value: negative, color: '#dc2626' },
  ];

  if (total === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-white/40 text-sm">No sentiment data yet</p>
      </div>
    );
  }

  const positivePercent = Math.round((positive / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
        Sentiment Analysis
      </h3>

      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={4}
                dataKey="value"
                animationBegin={0}
                animationDuration={1200}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#16161d',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neonBlue" />
              <span className="text-sm text-white/70">Positive</span>
            </div>
            <span className="text-sm font-semibold text-neonBlue">{positive} ({positivePercent}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-crimson" />
              <span className="text-sm text-white/70">Negative</span>
            </div>
            <span className="text-sm font-semibold text-crimson">{negative} ({100 - positivePercent}%)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
