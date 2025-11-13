import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const TrendChart = ({ data = [] }) => (
  <div className="glass-panel rounded-3xl p-4">
    <h3 className="font-semibold">Performa 14 Hari Terakhir</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#d4af37" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(val) => `Rp ${Number(val).toLocaleString('id-ID')}`} />
          <Area type="monotone" dataKey="total" stroke="#d4af37" fill="url(#goldGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default TrendChart;
